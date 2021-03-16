import Component from '@glimmer/component';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import ColumnMetadataModel from 'navi-data/models/metadata/column';
import { guidFor } from '@ember/object/internals';
import { searchRecords } from 'navi-core/utils/search';
import { tracked } from '@glimmer/tracking';

interface ColumnSelectorArgs {
  title: string;
  allColumns: Array<ColumnMetadataModel>;
  selectedColumns: Array<ColumnFragment>;
  onAddColumn(column: ColumnMetadataModel): void;
  onAddFilter(column: ColumnMetadataModel): void;
}

export default class ColumnSelector extends Component<ColumnSelectorArgs> {
  @tracked
  query = '';

  guid = guidFor(this);

  get selectedColumns() {
    return this.args.selectedColumns.reduce((items: Record<string, boolean>, item) => {
      items[item.columnMetadata.id] = true;
      return items;
    }, {});
  }

  get filteredColumns() {
    const {
      query,
      args: { allColumns },
    } = this;

    return query ? searchRecords(allColumns, query, 'name') : allColumns;
  }
}
