/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { assert } from '@ember/debug';
import RouteAction from 'ember-route-action-helper/helpers/route-action';
import { UpdateReportActions } from 'navi-reports/services/update-report-action-dispatcher';

const ROUTE_ACTION = 'onUpdateReport';

export default RouteAction.extend({
  /**
   * Returns a closure action that validates the report action
   * name and sends it out to be dispatched by the report-action-dispatcher
   *
   * @method compute
   * @override
   * @params {Array} - The positional arguments to the helper
   * @returns {Function} - Closure action
   */
  compute([reportAction, ...params]) {
    let actionName = UpdateReportActions[reportAction];
    assert(`The action name "${actionName}" is not a valid update report action`, actionName);
    return this._super([ROUTE_ACTION, actionName, ...params]);
  }
});
