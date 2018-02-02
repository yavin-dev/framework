/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import RouteAction from 'ember-route-action-helper/helpers/route-action';
import { ReportActions } from 'navi-reports/services/report-action-dispatcher';

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
    let actionName = ReportActions[reportAction];
    Ember.assert(`The action name "${actionName}" is not a valid report action`, actionName);
    return this._super([ROUTE_ACTION, actionName, ...params]);
  }
});
