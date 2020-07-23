import DS from 'ember-data';
import { fragment } from 'ember-data-model-fragments/attributes';

export default DS.Model.extend({
  // lineChart: fragment('line-chart', { defaultValue: {} }),
  // barChart: fragment('bar-chart', { defaultValue: {} }),
  querystats: fragment('querystats', { defaultValue: {} })
  // goalGauge: fragment('goalGauge', { defaultValue: {} }),
  // metricLabel: fragment('metricLabel', { defaultValue: {} }),
  // pieChart: fragment('pie-chart', { defaultValue: {} })
});
