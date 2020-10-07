import DS from 'ember-data';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import TableFragment from 'navi-core/models/table';
import MetricLabel from 'navi-core/models/metric-label';

export default class AllTheFragments extends DS.Model {
  @fragment('line-chart', { defaultValue: {} })
  lineChart!: DS.Model;
  @fragment('bar-chart', { defaultValue: {} })
  barChart!: DS.Model;
  @fragment('table', { defaultValue: {} })
  table!: TableFragment;
  @fragment('goalGauge', { defaultValue: {} })
  goalGauge!: DS.Model;
  @fragment('metricLabel', { defaultValue: {} })
  metricLabel!: MetricLabel;
  @fragment('pie-chart', { defaultValue: {} })
  pieChart!: DS.Model;
}
// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'all-the-fragments': AllTheFragments;
  }
}
