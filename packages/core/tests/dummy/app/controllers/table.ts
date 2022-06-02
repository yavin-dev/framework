import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
//@ts-ignore
import { merge } from 'lodash-es';
import { Args, TableColumn } from 'navi-core/components/navi-visualizations/table';
import { ModelFrom } from 'navi-core/utils/type-utils';
import TableRoute from '../routes/table';
import ColumnFragment from 'navi-core/models/request/column';
import { TableColumnAttributes } from 'navi-core/serializers/table';
import type YavinVisualizationsService from 'navi-core/services/visualization';

export default class TableController extends Controller {
  declare model: ModelFrom<TableRoute>;

  @service('visualization') declare visualizationService: YavinVisualizationsService;

  get manifest() {
    return this.visualizationService.getVisualization('yavin:table');
  }

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
    const updateAction = (this as any)[actionType] as (...args: any[]) => void;
    updateAction(...options);
  }

  @action
  onUpdateConfig(configUpdate: any) {
    this.options = merge({}, this.options, configUpdate);
  }
}
