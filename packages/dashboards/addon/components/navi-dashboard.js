/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{navi-dashboard
 *      dashboard=dashboardModel
 *      dataForWidget=widgetIdToDataMap
 *      saveAction=actionToSave
 *      deleteAction=actionToDelete
 *   }}
 */
import Component from '@ember/component';
import layout from '../templates/components/navi-dashboard';

export default Component.extend({
  layout,

  /**
   * @property {String} classNames
   */
  classNames: 'navi-dashboard'
});
