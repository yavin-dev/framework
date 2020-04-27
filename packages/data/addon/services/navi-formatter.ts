/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import Metric from '../models/metadata/metric';
import { omit } from 'lodash-es';

export default class NaviFormatterService extends Service {
  /**
   * Formats a metric
   * @param {Metric} metric - metric metadata object
   * @param {Dict<string|number>} parameters - metric parameters
   * @param {string} alias - aliased name for metric
   * @returns {string} - formatted string
   */
  formatMetric(metric?: Metric, parameters?: Dict<string | number>, alias?: string): string {
    const allParams = omit(parameters || {}, 'as');
    const paramValues = Object.values(allParams);

    const name = alias || metric?.name || '--';
    if (paramValues.length) {
      return `${name} (${paramValues.join(',')})`;
    } else {
      return name;
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'navi-formatter': NaviFormatterService;
  }
}
