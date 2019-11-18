/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Preview
 *
 * Usage:
 *  <NaviRequestPreview
 *    @request={{this.request}}
 *    @visualization={{this.request}}
 *    @onRemoveMetric={{action "oneRemoveMetric"}}
 *    @onRemoveDimension={{action "onRemoveDimension"}}
 *    @onRemoveTimeGrain={{action "onRemoveTimeGrain"}}
 *    @onAddSort={{action "onAddSort"}}
 *    @onRemoveSort={{action "onRemoveSort"}}
 *  />
 */
import Component from '@ember/component';
import layout from '../templates/components/navi-request-preview';
import { layout as templateLayout, classNames, tagName } from '@ember-decorators/component';
import { computed, get, set } from '@ember/object';
import { capitalize } from '@ember/string';
import { A as arr } from '@ember/array';
import { inject as service } from '@ember/service';
import { debounce } from '@ember/runloop';

const ID_FIELD_MAP = {
  metric: metric => metric.canonicalName,
  dimension: dimension => dimension.dimension.name,
  dateTime: () => 'dateTime'
};

const NEXT_SORT_DIRECTION = {
  none: 'desc',
  desc: 'asc',
  asc: 'none'
};

@tagName('div')
@classNames('navi-request-preview')
@templateLayout(layout)
class NaviRequestPreview extends Component {
  /**
   * @property {Service} metricName
   */
  @service
  metricName;

  /**
   * @property {Object} editingColumn - The column object that is currently being edited, null if not editing
   */
  editingColumn = null;

  /**
   * @property {Object[]} columns - column objects rendered in the template
   */
  @computed(
    'request.{sort.@each.direction,metrics.[],dimensions.[],logicalTable.timeGrain}',
    'visualization.metadata.style.aliases.@each.as'
  )
  get columns() {
    const visualization = this.visualization;
    const sort = this.request.sort;
    const metrics = this.request.metrics.toArray().map(metric => {
      return {
        type: 'metric',
        name: metric.canonicalName,
        displayName: this.getDisplayName(metric, 'metric', visualization),
        sort: (sort.findBy('metric.canonicalName', metric.canonicalName) || { direction: 'none' }).direction
      };
    });
    const dimensions = this.request.dimensions.toArray().map(dimension => {
      return {
        type: 'dimension',
        name: dimension.dimension.name,
        displayName: this.getDisplayName(dimension, 'dimension', visualization),
        sort: null //TODO: Support sorts on dimensions
      };
    });
    const columns = [...dimensions, ...metrics];
    const timeGrain = this.request.logicalTable.timeGrain;

    if (timeGrain.name !== 'all') {
      columns.unshift({
        type: 'dateTime',
        name: 'dateTime',
        displayName: this.getDisplayName(timeGrain, 'dateTime', visualization),
        sort: (sort.findBy('metric.canonicalName', 'dateTime') || { direction: 'none' }).direction
      });
    }

    return columns;
  }

  /**
   * Return display name from visualization metadata or default display name for metric, dimension, or Date
   * @param {Object} asset
   * @param {String} type
   * @param {Object} visualization
   */
  getDisplayName(asset, type, visualization) {
    const visMetaData = visualization.metadata.style || {};
    const nameServiceMap = {
      metric: function(metric) {
        return this.metricName.getDisplayName(metric.serialize());
      }.bind(this),
      dimension: function(dimension) {
        return dimension.dimension.longName || dimension.dimension.name;
      },
      dateTime: () => 'Date'
    };

    const alias = (get(visMetaData, `aliases`) || []).find(
      alias => alias.name === ID_FIELD_MAP[type](asset) && alias.type === type
    );

    return alias && alias.as ? alias.as : nameServiceMap[type](asset);
  }

  /**
   * @method calculatePosition
   * @returns {Object} - positioning info used by ember-basic-dropdown
   */
  calculatePosition(trigger /*, content */) {
    let { top, left, height } = trigger.getBoundingClientRect(),
      marginFromTopBar = 5,
      paddingFromLeft = 22,
      style = {
        left: left - paddingFromLeft,
        top: top + height + marginFromTopBar
      };

    return { style };
  }

  /**
   * @method doUpdateColumnName - update the display name of the current editingColumn in the visualization metadata
   * @param {String} newName
   */
  doUpdateColumnName(newName) {
    const metadata = this.visualization.metadata;
    const editingColumn = this.editingColumn;

    if (metadata && editingColumn) {
      const aliases = get(metadata, 'style.aliases');
      if (aliases) {
        const existingAlias = aliases.find(
          alias => alias.name === editingColumn.name && alias.type === editingColumn.type
        );
        if (existingAlias) {
          set(existingAlias, 'as', newName);
        } else {
          aliases.pushObject({
            type: editingColumn.type,
            name: editingColumn.name,
            as: newName
          });
        }
      } else {
        set(metadata, 'style', {
          aliases: arr([
            {
              name: editingColumn.name,
              type: editingColumn.type,
              as: newName
            }
          ])
        });
      }
    }
  }

  actions = {
    /**
     * @action
     * @param {Object} column - contains type and name of column to remove from request
     * @param {Object} dropdown - ember basic dropdown public api, used to close dropdown on removal
     */
    removeColumn(column, dropdown) {
      const { type, name } = column;
      const request = this.request;
      const removalType = type === 'dateTime' ? 'TimeGrain' : capitalize(type);
      const removalHandler = get(this, `onRemove${removalType}`);
      const fragmentToRemove = {
        dimension: () => request.dimensions.findBy('dimension.name', name).dimension,
        metric: () => request.metrics.findBy('canonicalName', name).metric,
        dateTime: () => request.logicalTable.timeGrain
      }[type]();

      if (removalHandler && fragmentToRemove) {
        removalHandler(fragmentToRemove);
        dropdown.actions.close();

        if (this.editingColumn && this.editingColumn.type === type && this.editingColumn.name === name) {
          this.set('editingColumn', null);
        }
      }
    },

    /**
     * @action
     * @param {Object} column - contains type and name of column to remove from request
     * @param {Object} dropdown - ember basic dropdown public api, used to close dropdown on edit
     */
    editColumn(column, dropdown) {
      dropdown.actions.close();
      this.set('editingColumn', column);
    },

    /**
     * @action
     */
    closeColumnConfig() {
      this.set('editingColumn', null);
    },

    /**
     * @action
     * @param {String} newName - New display name for the current editingColumn
     */
    updateColumnName(newName) {
      debounce(this, 'doUpdateColumnName', newName, 300);
    },

    /**
     * @action
     * @param {Object} column - column that the sort should be applied to or removed from
     */
    sortClicked(column) {
      const type = column.type;
      const currentSort = column.sort;
      const nextDirection = type === 'dateTime' && currentSort === 'asc' ? 'desc' : NEXT_SORT_DIRECTION[currentSort];

      if (currentSort && nextDirection) {
        if (nextDirection === 'none') {
          this.onRemoveSort(column.name);
        } else {
          this.onAddSort(column.name, nextDirection);
        }
      }
    }
  };
}

export default NaviRequestPreview;
