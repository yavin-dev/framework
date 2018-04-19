/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#dashboard-actions/schedule
 *      model=dashboard
 *      onSave=(action 'onSave')
 *      onRevert=(action 'onRevert')
 *      onDelete=(action 'onDelete')
 *   }}
 *      Inner template
 *   {{/dashboard-actions/schedule}}
 */

import { A as arr } from '@ember/array';

import ScheduleAction from 'navi-reports/components/common-actions/schedule';

export default ScheduleAction.extend({
  /**
   * @property {Array} formats
   */
  formats: arr(['pdf'])
});
