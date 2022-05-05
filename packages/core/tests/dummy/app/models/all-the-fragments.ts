import Model from '@ember-data/model';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import TableFragment from 'navi-core/models/table';
import MetricLabel from 'navi-core/models/metric-label';

export default class AllTheFragments extends Model {
  @fragment('table', { defaultValue: {} })
  table!: TableFragment;
  @fragment('metricLabel', { defaultValue: {} })
  metricLabel!: MetricLabel;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'all-the-fragments': AllTheFragments;
  }
}
