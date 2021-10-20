import Model, { attr } from '@ember-data/model';
//@ts-ignore
import { fragment, fragmentArray } from 'ember-data-model-fragments/attributes';
import type FragmentArray from 'ember-data-model-fragments/FragmentArray';
import type FilterFragment from 'navi-core/models/fragments/filter';
import type ColumnFragment from 'navi-core/models/fragments/column';
import type SortFragment from 'navi-core/models/fragments/sort';
import type RequestFragment from 'navi-core/models/request';

export default class FragmentsV2MockModel extends Model {
  @fragmentArray('fragments/filter')
  declare filters: FragmentArray<FilterFragment>;
  @fragmentArray('fragments/column')
  declare columns: FragmentArray<ColumnFragment>;
  @fragmentArray('fragments/sort')
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
