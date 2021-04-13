import Model, { attr } from '@ember-data/model';
//@ts-ignore
import { fragment, fragmentArray } from 'ember-data-model-fragments/attributes';
import type FragmentArray from 'ember-data-model-fragments/FragmentArray';
import type FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import type ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import type SortFragment from 'navi-core/models/bard-request-v2/fragments/sort';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';

export default class FragmentsV2MockModel extends Model {
  @fragmentArray('bard-request-v2/fragments/filter')
  declare filters: FragmentArray<FilterFragment>;
  @fragmentArray('bard-request-v2/fragments/column')
  declare columns: FragmentArray<ColumnFragment>;
  @fragmentArray('bard-request-v2/fragments/sort')
  declare sorts: FragmentArray<SortFragment>;
  @fragment('bard-request-v2/request')
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
