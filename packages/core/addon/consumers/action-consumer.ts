/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import Ember from 'ember';

export default class ActionConsumer extends EmberObject.extend(Ember.ActionHandler) {
  /**
   * Overrides the sending of an action to filter out unwanted actions
   * @param actionName the name of the action to perform
   * @param args the args to pass to the action handler
   */
  send(actionName: string, ...args: unknown[]) {
    if (this.shouldConsumeAction(actionName, ...args)) {
      super.send(actionName, ...args);
    }
    return undefined;
  }

  /**
   * Filters out actions based on the name and parameters
   * @param _actionName the name of the action to perform
   * @param _args the args to pass to the action handler
   */
  shouldConsumeAction(_actionName: string, ..._args: unknown[]) {
    return true;
  }
}
