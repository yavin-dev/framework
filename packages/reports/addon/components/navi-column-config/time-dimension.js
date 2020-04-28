/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config DateTime Component
 *
 * Usage:
 *  <NaviColumnConfig::TimeDimension
 *    @column={{this.column}}
 *    @metadata={{this.visualization.metadata}}
 *    @onUpdateColumnName={{this.onUpdateColumnName}}
 *    @onUpdateTimeGrain={{this.onUpdateTimeGrain}}
 *  />
 */
import Component from '@ember/component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/navi-column-config/time-dimension';
import { action } from '@ember/object';

@tagName('')
@templateLayout(layout)
class NaviColumnConfigTimeDimensionComponent extends Component {
  /**
   * @action
   * @param {Object} timeGrain
   */
  @action
  updateTimeGrain(timeGrain) {
    this.onUpdateTimeGrain?.(timeGrain);
  }
}

export default NaviColumnConfigTimeDimensionComponent;
