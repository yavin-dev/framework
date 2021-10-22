import Model, { attr } from '@ember-data/model';
//@ts-ignore
import { fragment, fragmentArray } from 'ember-data-model-fragments/attributes';
import type FragmentArray from 'ember-data-model-fragments/FragmentArray';
import type FilterFragment from 'navi-core/models/request/filter';
import type ColumnFragment from 'navi-core/models/request/column';
import type SortFragment from 'navi-core/models/request/sort';
import type RequestFragment from 'navi-core/models/request';

export default class FragmentsV2MockModel extends Model {
  @fragmentArray('request/filter')
  declare filters: FragmentArray<FilterFragment>;
  @fragmentArray('request/column')
  declare columns: FragmentArray<ColumnFragment>;
  @fragmentArray('request/sort')
  declare sorts: FragmentArray<SortFragment>;
  @fragment('request')
  declare request: RequestFragment;
  @attr('string', { defaultValue: 'bardOne' })
  declare dataSource: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'fragments-v2-mock': FragmentsV2MockModel;
  }
}
