import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
//@ts-ignore
import { merge } from 'lodash-es';
import { Args, TableColumn } from 'navi-core/components/navi-visualizations/table';
import { ModelFrom } from 'navi-core/utils/type-utils';
import TableRoute from '../routes/table';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { TableColumnAttributes } from 'navi-core/serializers/table';

export default class TableController extends Controller {
  @tracked model!: ModelFrom<TableRoute>;

  @tracked isEditing = false;

  get request() {
    return this.model[0].request;
  }

  get visualization() {
    return {
      type: 'table',
      version: 1,
      metadata: this.options,
    };
  }

  //options passed through to the table component
  @tracked options: Args['options'] = {
    columnAttributes: {},
    showTotals: {},
  };

  @action
  upsertSort(columnFragment: ColumnFragment, direction: string) {
    this.request.set('sorts', [
      {
        type: columnFragment.type,
        field: columnFragment.field,
        parameters: columnFragment.parameters,
        direction: direction,
      },
    ]);
  }

  @action
  removeSort() {
    this.request.set('sorts', []);
  }

  @action
  updateColumn(updatedColumn: TableColumn) {
    const columnAttributes = { ...this.options.columnAttributes };
    columnAttributes[updatedColumn.columnId] = updatedColumn.attributes;

    this.options = { columnAttributes };
  }

  @action
  renameColumnFragment(column: ColumnFragment, name: string | undefined) {
    set(column, 'alias', name);
  }

  @action
  updateColumnOrder(newColumnOrder: TableColumn[]) {
    const columnAttributes = newColumnOrder.reduce((columnAttributes, columnInfo, index) => {
      columnAttributes[index] = columnInfo.attributes;
      return columnAttributes;
    }, {} as Record<number, TableColumnAttributes>);
    const reorderedColumns = newColumnOrder.map((c) => c.fragment);

    this.options = { columnAttributes };
    // TS doesn't like that we set this directly
    //@ts-expect-error
    set(this.request, 'columns', reorderedColumns);
  }

  @action
  onUpdateReport(actionType: string, ...options: any[]) {
    const updateAction = (this as any)[actionType] as Function;
    updateAction(...options);
  }

  @action
  onUpdateConfig(configUpdate: any) {
    this.options = merge({}, this.options, configUpdate);
  }
}
