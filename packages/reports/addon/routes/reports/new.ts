/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type CompressionService from 'navi-core/services/compression';
import type UserService from 'navi-core/services/user';
import type { Transition } from 'navi-core/utils/type-utils';
import type ReportModel from 'navi-core/models/report';
import type { ReportLike } from 'navi-reports/routes/reports/report';
import type YavinVisualizationsService from 'navi-core/services/visualization';
import type YavinClientService from 'navi-data/services/yavin-client';

export default class ReportsNewRoute extends Route {
  @service declare naviNotifications: NaviNotificationsService;

  @service declare visualization: YavinVisualizationsService;

  @service declare compression: CompressionService;

  @service declare user: UserService;

  @service declare yavinClient: YavinClientService;

  queryParams = {
    datasource: {},
  };

  model(_params: Record<string, unknown>, transition: Transition): Promise<ReportLike> {
    const modelQueryParam = transition.to?.queryParams?.model;
    const datasource = transition.to?.queryParams?.datasource;
    // Allow for a report to be passed through the URL
    return modelQueryParam ? this.deserializeUrlModel(modelQueryParam) : this.newModel(datasource);
  }

  /**
   * Transitions to newly created report
   */
  afterModel(report: ReportModel): Transition {
    return this.replaceWith('reports.report.edit', report.tempId);
  }

  private async deserializeUrlModel(modelString: string): Promise<ReportLike> {
    try {
      const model = (await this.compression.decompressModel(modelString)) as ReportModel;
      await model.request?.loadMetadata();
      return model.clone();
    } catch (e) {
      throw new Error('Could not parse model query param');
    }
  }

  /**
   * Returns a new model for this route
   */
  protected async newModel(dataSource?: string): Promise<ReportLike> {
    const owner = this.user.getUser();
    const defaultVisualization = this.visualization.defaultVisualization();
    if (dataSource !== undefined) {
      try {
        this.yavinClient.clientConfig.getDataSource(dataSource); //validate datasource param
      } catch (e) {
        throw new Error('Could not locate requested data source');
      }
    }
    const report = this.store.createRecord('report', {
      owner,
      request: this.store.createFragment('request', {
        dataSource,
      }),
    });
    report.updateVisualization(defaultVisualization.createModel());
    return report;
  }
}
