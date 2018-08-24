/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { join } from '@ember/runloop';
import { ReportActions } from 'navi-reports/services/report-action-dispatcher';
import Ember from 'ember';

const ClosureActionModule = 'ember-glimmer/helpers/action' in Ember.__loader.registry ?
  Ember.__loader.require('ember-glimmer/helpers/action') :
  { };

export default Helper.extend({
  /**
   * @property {Service} reportActionDispatcher
   */
  reportActionDispatcher: service(),

  /**
   * Validates a report action and then dispatches it via the report action dispatcher
   *
   * @method reportAction
   * @param {Array} array with the name of the action to dispatch
   * @returns {Function} Closure action
   */
  compute([action, ...params]) {
    let actionName = ReportActions[action];
    assert(`The action name "${action}" is not a valid report action`, actionName);
    let reportAction = (() => join(() => get(this, 'reportActionDispatcher').dispatch(actionName, ...params))),
        ACTION = ClosureActionModule.ACTION;

    //Make the report action a "real" action
    reportAction[ACTION] = true;
    
    return reportAction;
  }
});
