import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';

export default interface ValuesComponentArgs {
  filter: FilterFragment;
  isCollapsed: boolean;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}
