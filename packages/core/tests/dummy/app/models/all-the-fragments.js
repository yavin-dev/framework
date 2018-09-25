import DS from 'ember-data';
import MF from 'model-fragments';

export default DS.Model.extend({
  lineChart: MF.fragment('line-chart', { defaultValue: {} }),
  barChart: MF.fragment('bar-chart', { defaultValue: {} }),
  table: MF.fragment('table', { defaultValue: {} }),
  goalGauge: MF.fragment('goalGauge', { defaultValue: {} }),
  metricLabel: MF.fragment('metricLabel', { defaultValue: {} }),
  pieChart: MF.fragment('pie-chart', { defaultValue: {} })
});
