/**
 * Copyright 2019, Yahoo Holdings Inc.
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
import { computed } from '@ember/object';

export default Component.extend({
  layout,

  /**
   * @property {String} classNames
   */
  classNames: ['navi-dashboard'],

  /**
   * This property exists because ember-data-model-fragments
   * does not always propagate dirty state up to the parent
   * https://github.com/lytics/ember-data-model-fragments/issues/330#issuecomment-514325233
   *
   * @property {Boolean} dashboardIsDirty
   */
  dashboardIsDirty: computed(
    'dashboard.{hasDirtyAttributes,filters.hasDirtyAttributes,presentation.hasDirtyAttributes}',
    function() {
      const dashboard = this.get('dashboard');

      return (
        dashboard.get('hasDirtyAttributes') ||
        dashboard.get('filters.hasDirtyAttributes') ||
        dashboard.get('presentation.hasDirtyAttributes')
      );
    }
  )
});
