/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';

export default Controller.extend({
  /**
   * @property {Array} queryParams - name of query params
   */
  queryParams: ['unsavedWidgetId'],

  /**
   * @property {String} unsavedWidgetId - uuid of unsaved widget
   */
  unsavedWidgetId: '',
});
