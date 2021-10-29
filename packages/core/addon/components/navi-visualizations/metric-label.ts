/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviVisualizations::MetricLabel
 *   @model={{this.model}}
 *   @options={{this.options}}
 * />
 */
import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { VisualizationModel } from './table';
import ColumnFragment from 'navi-core/models/request/column';
import { MetricLabelConfig } from 'navi-core/models/metric-label';
import type { MetricValue } from 'navi-data/serializers/facts/interface';

export type Args = {
  model: VisualizationModel;
  options: MetricLabelConfig['metadata'];
};

export default class MetricLabelVisualization extends Component<Args> {
  /**
   * font size is small, medium, or large depending on the length of the value
   * returns the appropriate font class
   */
  get fontSize(): string {
    const { value } = this;
    const length = value?.length || 0;

    if (length > 11) {
      return 'metric-label-vis__font--small';
    } else if (length <= 11 && length > 4) {
      return 'metric-label-vis__font--medium';
    } else {
      return 'metric-label-vis__font--large';
    }
  }

  @computed('args.{model.[],options.metricCid}')
  get metric(): ColumnFragment<'metric'> | undefined {
    const { request } = this.args.model?.firstObject || {};
    const { metricCid } = this.args.options;
    const metricColumn = request?.metricColumns.find(({ cid }) => cid === metricCid);
    return metricColumn;
  }

  /**
   * formats if there is a formatter configured
   */
  @computed('args.{options.format,model.[]}', 'metric')
  get value(): string | undefined {
    const { options, model } = this.args;
    const { metric } = this;
    if (model && metric) {
      const { response } = model?.firstObject || {};
      const firstRow = response?.rows?.[0] || {};
      const { canonicalName } = metric;
      const value = firstRow[canonicalName] as MetricValue;
      return metric.columnMetadata.formatValue(value, metric, firstRow, options.format);
    }
    return undefined;
  }
}
