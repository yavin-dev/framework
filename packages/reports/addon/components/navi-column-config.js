/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <NaviColumnConfig
 *    @isOpen={{true}}
 *    @drawerDidChange={{this.callback}}
 *    @report={{@report}}
 *    @onRemoveDateTime={{update-report-action "REMOVE_TIME_GRAIN"}}
 *    @onRemoveDimension={{update-report-action "REMOVE_DIMENSION_FRAGMENT"}}
 *    @onRemoveMetric={{update-report-action "REMOVE_METRIC_FRAGMENT"}}
 *  />
 */
import Component from '@ember/component';
import layout from '../templates/components/navi-column-config';
import { action, computed } from '@ember/object';
import { capitalize } from '@ember/string';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { inject as service } from '@ember/service';

@tagName('')
@templateLayout(layout)
class NaviColumnConfig extends Component {
  /**
   * @property fadeTransition - fade transition
   */
  *transition({ keptSprites, removedSprites, insertedSprites }) {
    let moveDuration;
    if (removedSprites.length > 0) {
      // when removing an item, we want to quickly fill in the gap
      moveDuration = 50;
    }

    yield Promise.all([
      ...keptSprites.map(sprite => move(sprite, { duration: moveDuration })),
      ...insertedSprites.map(sprite => fadeIn(sprite, { duration: 100 })),
      ...removedSprites.map(sprite => fadeOut(sprite, { duration: 0 }))
    ]);
  }

  @computed('report.request.{metrics.[],dimensions.[],logicalTable.timeGrain}')
  get columns() {
    const {
      metrics,
      dimensions,
      logicalTable: { timeGrain }
    } = this.report.request;

    const metricColumns = metrics.toArray().map(metric => {
      return {
        type: 'metric',
        name: metric.canonicalName,
        displayName: this.getDisplayName(metric, 'metric'),
        fragment: metric
      };
    });
    const dimensionColumns = dimensions.toArray().map(dimension => {
      return {
        type: 'dimension',
        name: dimension.dimension.name,
        displayName: this.getDisplayName(dimension, 'dimension'),
        fragment: dimension
      };
    });

    const columns = [...dimensionColumns, ...metricColumns];

    if (timeGrain.name !== 'all') {
      columns.unshift({
        type: 'dateTime',
        name: 'dateTime',
        displayName: this.getDisplayName(timeGrain, 'dateTime'),
        fragment: timeGrain
      });
    }

    return columns;
  }

  /**
   * @property {Service} metricName
   */
  @service metricName;

  /**
   * @method getDisplayName
   * @param {Object} asset
   * @param {String} type
   * @param {Object} visualization
   * @returns {String} display name from visualization metadata or default display name for metric, dimension, or Date
   */
  getDisplayName(asset, type) {
    const nameServiceMap = {
      metric: metric => this.metricName.getDisplayName(metric.serialize()),
      dimension: dimension => dimension.dimension.longName || dimension.dimension.name,
      dateTime: dateTime => `Date Time (${dateTime.longName})`
    };

    return nameServiceMap[type](asset);
  }

  /**
   * @action
   * @param {Object} column - contains type and name of column to remove from request
   */
  @action
  removeColumn(column) {
    const { type } = column;
    const removalHandler = this[`onRemove${capitalize(type)}`];
    removalHandler?.(column.fragment);
  }

  /**
   * Stores element reference after render
   * @param element - element inserted
   */
  @action
  setupElement(element) {
    this.componentElement = element;
  }

  /**
   * Drawer transition
   * @param context - animation context
   */
  @action
  *drawerTransition({ insertedSprites, removedSprites }) {
    const offset = 500; // 2x the size of the drawer
    const x = this.componentElement.getBoundingClientRect().left - offset;
    yield Promise.all([
      ...removedSprites.map(sprite => {
        sprite.applyStyles({ 'z-index': '1' });
        sprite.endAtPixel({ x });
        return move(sprite, { easing: easeIn });
      }),
      ...insertedSprites.map(sprite => {
        sprite.startAtPixel({ x });
        sprite.applyStyles({ 'z-index': '1' });
        return move(sprite, { easing: easeOut });
      })
    ]);
    this.drawerDidChange?.();
  }
}
export default NaviColumnConfig;
