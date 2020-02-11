/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Preview
 *
 * Usage:
 *  <NaviRequestPreview
 *    @request={{this.request}}
 *    @visualization={{this.visualization}}
 *    @onRemoveMetric={{action "onRemoveMetric"}}
 *    @onRemoveDimension={{action "onRemoveDimension"}}
 *    @onRemoveTimeGrain={{action "onRemoveTimeGrain"}}
 *    @onAddSort={{action "onAddSort"}}
 *    @onRemoveSort={{action "onRemoveSort"}}
 *  />
 */
import Component from '@ember/component';
import layout from '../templates/components/navi-request-preview';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { computed, get, set, action } from '@ember/object';
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

@tagName('')
@templateLayout(layout)
class NaviRequestPreview extends Component {
  /**
   * @property {Service} metricName
   */
  @service
  metricName;

  /**
   * @private
   * @property {Number} _editingColumnIndex - null when not editing column, index of the edited column otherwise
   */
  _editingColumnIndex = null;

  /**
   * @property {Object} editingColumn - The column object that is currently being edited, null if not editing
   */
  @computed('_editingColumnIndex', 'columns.[]')
  get editingColumn() {
    const { _editingColumnIndex: columnIndex, columns } = this;

    if (typeof columnIndex === 'number' && 0 <= columnIndex && columnIndex < this.columns.length) {
      return columns[columnIndex];
    }
    return null;
  }

  /**
   * @property {Object[]} columns - column objects rendered in the template
   */
  @computed(
    'request.{sort.@each.direction,metrics.@each.parameters,dimensions.[],logicalTable.timeGrain}',
    'visualization.metadata.style.aliases.@each.as',
    'editingColumn.fragment.parameters.[]'
  )
  get columns() {
    const {
      visualization,
      request: { sort }
    } = this;
    const metrics = this.request.metrics.toArray().map(metric => {
      return {
        type: 'metric',
        name: metric.canonicalName,
        displayName: this.getDisplayName(metric, 'metric', visualization),
        sort: (sort.findBy('metric.canonicalName', metric.canonicalName) || { direction: 'none' }).direction,
        fragment: metric
      };
    });
    const dimensions = this.request.dimensions.toArray().map(dimension => {
      return {
        type: 'dimension',
        name: dimension.dimension.name,
        displayName: this.getDisplayName(dimension, 'dimension', visualization),
        sort: null, //TODO: Support sorts on dimensions
        fragment: dimension
      };
    });
    const columns = [...dimensions, ...metrics];
    const timeGrain = this.request.logicalTable.timeGrain;

    if (timeGrain.name !== 'all') {
      columns.unshift({
        type: 'dateTime',
        name: 'dateTime',
        displayName: this.getDisplayName(timeGrain, 'dateTime', visualization),
        sort: (sort.findBy('metric.canonicalName', 'dateTime') || { direction: 'none' }).direction,
        fragment: timeGrain
      });
    }

    return columns;
  }

  /**
   * @method getDisplayName
   * @param {Object} asset
   * @param {String} type
   * @param {Object} visualization
   * @returns {String} display name from visualization metadata or default display name for metric, dimension, or Date
   */
  getDisplayName(asset, type, visualization) {
    const visMetaData = visualization.metadata.style || {};
    const nameServiceMap = {
      metric: metric => {
        return this.metricName.getDisplayName(metric.serialize());
      },
      dimension: dimension => {
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
    const { top, left, height } = trigger.getBoundingClientRect(),
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
    const {
      visualization: { metadata },
      editingColumn
    } = this;

    if (metadata && editingColumn) {
      if (!get(metadata, 'style.aliases')) {
        set(metadata, 'style', {
          aliases: arr([])
        });
      }

      const aliases = get(metadata, 'style.aliases');
      const existingAlias = aliases.find(
        alias => alias.name === editingColumn.name && alias.type === editingColumn.type
      );

      if (existingAlias) {
        if (newName === '') {
          aliases.removeObject(existingAlias);
        } else {
          set(existingAlias, 'as', newName);
        }
      } else if (newName !== '') {
        aliases.pushObject({
          type: editingColumn.type,
          name: editingColumn.name,
          as: newName
        });
      }
    }
  }

  /**
   * @action
   * @param {Object} column - contains type and name of column to remove from request
   * @param {Object} dropdown - ember basic dropdown public api, used to close dropdown on removal
   * @param {Number} columnIndex - index of the column being removed
   */
  @action
  removeColumn(column, dropdown, columnIndex) {
    const { type } = column;
    const removalType = type === 'dateTime' ? 'TimeGrain' : capitalize(type);
    const removalHandler = get(this, `onRemove${removalType}`);
    const fragmentToRemove = column.fragment;

    if (removalHandler && fragmentToRemove) {
      removalHandler(fragmentToRemove);
      dropdown.actions.close();

      if (this._editingColumnIndex === columnIndex) {
        this.set('_editingColumnIndex', null);
      }
    }
  }

  /**
   * @action
   * @param {Object} index - index of the column we want to edit
   * @param {Object} dropdown - ember basic dropdown public api, used to close dropdown on edit
   */
  @action
  editColumn(index, dropdown) {
    dropdown.actions.close();
    this.set('_editingColumnIndex', index);
  }

  /**
   * @action
   */
  @action
  closeColumnConfig() {
    this.set('_editingColumnIndex', null);
  }

  /**
   * @action
   * @param {String} newName - New display name for the current editingColumn
   */
  @action
  updateColumnName(newName) {
    debounce(this, 'doUpdateColumnName', newName, 300);
  }

  /**
   * @action
   * @param {Object} column - column that the sort should be applied to or removed from
   */
  @action
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
}

export default NaviRequestPreview;
