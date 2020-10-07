/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <DashboardActions::Schedule
 *     @model={{@dashboard}}
 *     @disabled={{not @dashboard.validations.isTruelyValid}}
 *     @onSave={{this.onSave}}
 *     @onRevert={{this.onRevert}}
 *     @onDelete={{this.onDelete}}
 *   >
 *     Inner template
 *   </DashboardActions::Schedule>
 */

import { A as arr } from '@ember/array';
import ScheduleActionComponent from 'navi-reports/components/common-actions/schedule';
import { computed } from '@ember/object';

export default class DashboardScheduleActionComponent extends ScheduleActionComponent {
  /**
   * @property {Array} formats
   * @override
   */
  @computed
  get formats() {
    return arr(super.formats.without('csv'));
  }
}
