/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { reject } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import config from 'ember-get-config';
import { A } from '@ember/array';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type NaviVisualizationsService from 'navi-reports/services/navi-visualizations';
import type CompressionService from 'navi-core/services/compression';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type UserService from 'navi-core/services/user';
import type { Transition } from 'navi-core/utils/type-utils';
import type ReportModel from 'navi-core/models/report';

export default class ReportsNewRoute extends Route {
  @service declare naviNotifications: NaviNotificationsService;

  @service declare naviVisualizations: NaviVisualizationsService;

  @service declare compression: CompressionService;

  @service('navi-metadata') declare metadataService: NaviMetadataService;

  @service declare user: UserService;

  /**
   * @override
   * @returns route model
   */
  model(_params: {}, transition: Transition) {
    const modelQueryParam = transition.to?.queryParams?.model;

    // Allow for a report to be passed through the URL
    if (modelQueryParam) {
      return this._deserializeUrlModel(modelQueryParam);
    }

    return this._newModel();
  }

  /**
   * Transitions to newly created report
   *
   * @param report - resolved report model
   * @override
   */
  afterModel(report: ReportModel) {
    return this.replaceWith('reports.report.edit', report.tempId);
  }

  /**
   * @private
   * @param modelString - compressed model
   * @returns promise that resolves to new model
   */
  _deserializeUrlModel(modelString: string) {
    return this.compression
      .decompressModel(modelString)
      .then((model: ReportModel) => {
        return this.store.createRecord('report', model.clone());
      })
      .catch(() => reject(new Error('Could not parse model query param')));
  }

  /**
   * Returns a new model for this route
   *
   * @method _newModel
   * @private
   * @returns {Promise} route model
   */
  _newModel() {
    const author = this.user.getUser();
    const defaultVisualization = this.naviVisualizations.defaultVisualization();
    const table = this._getDefaultTable();

    const report = this.store.createRecord('report', {
      author,
      request: this.store.createFragment('bard-request-v2/request', {
        table: table.id,
        dataSource: table.source,
      }),
      visualization: { type: defaultVisualization },
    });
    return report;
  }

  /**
   * Returns a default table model for new report
   *
   * @method _getDefaultTable
   * @private
   * @returns {Object} table model
   */
  _getDefaultTable() {
    const { metadataService } = this;
    const factTables = metadataService.all('table').filter((t) => t.isFact === true);
    let table = factTables.find((t) => t.id === config.navi.defaultDataTable);
    if (!table) {
      table = A(factTables).sortBy('name')[0];
    }
    return table;
  }
}
