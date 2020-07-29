import DS from 'ember-data';
import RequestV2Fragment from 'navi-core/models/bard-request-v2/request';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import SortFragment from 'navi-core/models/bard-request-v2/fragments/sort';

interface FragmentRegistry {
  'bard-request-v2/request': RequestV2Fragment;
  'bard-request-v2/fragments/column': ColumnFragment;
  'bard-request-v2/fragments/filter': FilterFragment;
  'bard-request-v2/fragments/sort': SortFragment;
  [key: string]: any;
}

declare class StoreWithFragment extends DS.Store {
  createFragment<K extends keyof FragmentRegistry>(fragmentName: K, attributes: object): FragmentRegistry[K];
}

export default StoreWithFragment;
