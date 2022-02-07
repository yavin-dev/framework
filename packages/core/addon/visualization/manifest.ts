/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import RequestFragment from 'navi-core/models/request';
import EmberObject from '@ember/object';
import VisualizationModel from 'navi-core/models/visualization-v2';
import type Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import type YavinVisualizationComponent from './component';
import type YavinVisualizationPanelComponent from './panel-component';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';

function isPresent<T>(t: T | undefined | null | void): t is T {
  return t !== undefined && t !== null;
}

export const formTypeName = (type: string, namespace: string): string => `${namespace}:${type}`;

export abstract class YavinVisualizationManifest<Settings = unknown> extends EmberObject {
  @service
  declare store: Store;

  abstract namespace: VisualizationModel['namespace'];

  abstract currentVersion: VisualizationModel['version'];

  abstract type: VisualizationModel['type'];

  abstract niceName: string;

  abstract icon: string;

  get typeName(): string {
    const { namespace, type } = this;
    return formTypeName(type, namespace);
  }

  abstract validate(request: RequestFragment): { isValid: boolean; messages?: string[] };

  abstract visualizationComponent: {} & YavinVisualizationComponent<Settings>['constructor'];

  settingsPanelComponent: ({} & YavinVisualizationPanelComponent<Settings>['constructor']) | null = null;

  abstract createNewSettings(): Settings;

  dataDidUpdate(currentSettings: Settings, _request: RequestFragment, _response: NaviFactResponse): Settings {
    return currentSettings;
  }

  normalizeModel(c: unknown): Promise<VisualizationModel<Settings>> {
    return Promise.resolve(c as VisualizationModel<Settings>);
  }

  serializeSettings(model: VisualizationModel): VisualizationModel {
    return model;
  }

  createModel(): VisualizationModel<Settings> {
    const { type, currentVersion: version, namespace } = this;
    const metadata = this.createNewSettings();
    return this.store.createFragment('visualization-v2', {
      type,
      version,
      namespace,
      metadata,
    }) as VisualizationModel<Settings>;
  }

  hasSingleMetric(request: RequestFragment): boolean {
    return request.metricColumns.length === 1;
  }

  hasNoMetric(request: RequestFragment): boolean {
    return request.metricColumns.length === 0;
  }

  hasMetric(request: RequestFragment): boolean {
    return !this.hasNoMetric(request);
  }

  hasExplicitSingleTimeBucket(request: RequestFragment): boolean {
    const { timeGrain, interval } = request;
    if (isPresent(timeGrain) && isPresent(interval)) {
      return interval?.diffForTimePeriod(timeGrain) === 1;
    }

    return false;
  }

  hasTimeGroupBy(request: RequestFragment): boolean {
    const { timeGrainColumn } = request;
    return isPresent(timeGrainColumn);
  }

  hasNoGroupBy(request: RequestFragment): boolean {
    return request.nonTimeDimensions.length === 0;
  }

  hasMultipleMetrics(request: RequestFragment): boolean {
    return request.metricColumns.length > 1;
  }

  hasPotentialMultipleTimeBuckets(request: RequestFragment): boolean {
    return this.hasTimeGroupBy(request) && !this.hasExplicitSingleTimeBucket(request);
  }

  hasGroupBy(request: RequestFragment): boolean {
    return !this.hasNoGroupBy(request);
  }
}
