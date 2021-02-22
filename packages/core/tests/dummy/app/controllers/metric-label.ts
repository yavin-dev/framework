import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { MetricLabelConfig } from 'navi-core/models/metric-label';
import { ModelFrom } from 'navi-core/utils/type-utils';
import MetricLabelRoute from '../routes/metric-label';

export default class MetricLabelController extends Controller {
  model!: ModelFrom<MetricLabelRoute>;
  @tracked metricLabelOptions = {
    format: '$0,0[.]00',
    metricCid: this.model.bottle.firstObject?.request.metricColumns[0].cid,
  };

  get metricVisualization() {
    return {
      type: 'metric-label',
      version: 2,
      metadata: this.metricLabelOptions,
    };
  }

  /**
   * merges config into the metricLabelOptions
   */
  @action
  onUpdateConfig(configUpdates: Partial<MetricLabelConfig>) {
    this.metricLabelOptions = { ...this.metricLabelOptions, ...configUpdates };
  }
}
