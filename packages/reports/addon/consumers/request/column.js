/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: service(),

  actions: {
    /**
     * @action ADD_COLUMN
     * @param route - route that has a model that contains a request property
     * @param columnMetadataModel - metadata model to add
     */
    [RequestActions.ADD_COLUMN](route, columnMetadataModel) {
      const {
        currentModel: { request }
      } = route;
      const column = request.addColumnFromMeta(columnMetadataModel);
      this.requestActionDispatcher.dispatch(RequestActions.DID_ADD_COLUMN, route, column);
    },

    /**
     * @action ADD_COLUMN_WITH_PARAMS
     * @param route - route that has a model that contains a request property
     * @param columnMetadataModel - metadata model to add
     * @param parameters - parameters applied to the column
     */
    [RequestActions.ADD_COLUMN_WITH_PARAMS](route, columnMetadataModel, parameters) {
      const {
        currentModel: { request }
      } = route;
      const column = request.addColumnFromMetaWithParams(columnMetadataModel, parameters);
      this.requestActionDispatcher.dispatch(RequestActions.DID_ADD_COLUMN, route, column);
    },

    /**
     * @action DID_ADD_COLUMN_
     * @param route - route that has a model that contains a request property
     * @param column - column fragment
     */
    [RequestActions.DID_ADD_COLUMN](route, column) {
      const controller = route.controllerFor(route.routeName);
      controller.setLastAddedColumn(column);
    },

    /**
     * @action REMOVE_COLUMN
     * @param route - route that has a model that contains a request property
     * @param columnMetadataModel - metadata model to add
     */
    [RequestActions.REMOVE_COLUMN]({ currentModel: { request } }, columnMetadataModel) {
      request.removeColumnByMeta(columnMetadataModel);
    },

    /**
     * @action REMOVE_COLUMN_WITH_PARAMS
     * @param route - route that has a model that contains a request property
     * @param columnMetadataModel - metadata model to add
     * @param parameters - parameters applied to the column
     */
    [RequestActions.REMOVE_COLUMN_WITH_PARAMS]({ currentModel: { request } }, columnMetadataModel, parameters) {
      request.removeColumnByMeta(columnMetadataModel, parameters);
    },

    /**
     * @action REMOVE_COLUMN_FRAGMENT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     */
    [RequestActions.REMOVE_COLUMN_FRAGMENT]({ currentModel: { request } }, columnFragment) {
      request.removeColumn(columnFragment);
    },

    /**
     * @action UPDATE_COLUMN_FRAGMENT_WITH_PARAMS
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     * @param parameterKey - the name of the parameter to update
     * @param parameterValue - the value to update the parameter with
     */
    [RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS](route, columnFragment, parameterKey, parameterValue) {
      columnFragment.updateParameters({ [parameterKey]: parameterValue });
    },

    /**
     * @action RENAME_COLUMN_FRAGMENT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     * @param alias - the new name for the column
     */
    [RequestActions.RENAME_COLUMN_FRAGMENT]({ currentModel: { request } }, columnFragment, alias) {
      request.renameColumn(columnFragment, alias);
    },

    /**
     * @action REORDER_COLUMN_FRAGMENT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     * @param index - the index to move the selected column
     */
    [RequestActions.REORDER_COLUMN_FRAGMENT]({ currentModel: { request } }, columnFragment, index) {
      request.reorderColumn(columnFragment, index);
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param route - route that has a model that contains a request property
     * @param metricMetadataModel - metadata model of metric whose filter is being added
     * @param parameters - parameters applied to the column
     */
    [RequestActions.ADD_METRIC_FILTER](route, metricMetadataModel, parameters) {
      // Metric filter can't exist without the metric present in the request

      if (
        route.currentModel.request.columns.find(
          column => column.type === 'metric' && column.columnMetadata === metricMetadataModel
        )
      ) {
        // When adding a metric filter with the requestPreview, users can add multiple of the same metric
        // So if the metric already exists we assume they don't want to add it again
        return;
      }

      if (parameters) {
        this.requestActionDispatcher.dispatch(
          RequestActions.ADD_COLUMN_WITH_PARAMS,
          route,
          metricMetadataModel,
          parameters
        );
      } else {
        this.requestActionDispatcher.dispatch(RequestActions.ADD_COLUMN, route, metricMetadataModel);
      }
    },

    /**
     * @action DID_UPDATE_TABLE
     * @param route - route that has a model that contains a request property
     * @param table - table that the request is updated with
     */
    [RequestActions.DID_UPDATE_TABLE](route, table) {
      const {
        currentModel: { request }
      } = route;
      const { metrics, dimensions } = table;

      /*
       * .toArray() is used to clone the array, otherwise removing a column while
       * iterating over `request.columns` causes problems
       */
      request.columns.toArray().forEach(column => {
        if (![...metrics, ...dimensions].includes(column.columnMetadata)) {
          this.requestActionDispatcher.dispatch(RequestActions.REMOVE_COLUMN, route, column.columnMetadata);
        }
      });
    }
  }
});
