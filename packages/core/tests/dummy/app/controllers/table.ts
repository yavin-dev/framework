import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
//@ts-ignore
import { isEqual, merge, omit } from 'lodash-es';
import { Args } from 'navi-core/components/navi-visualizations/table';
import { TableColumn } from 'navi-core/serializers/table';
import { ModelFrom } from 'navi-core/utils/type-utils';
import TableRoute from '../routes/table';

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
      metadata: this.options
    };
  }

  //options passed through to the table component
  @tracked options: Args['options'] = {
    columns: [
      {
        type: 'timeDimension',
        field: 'network.dateTime',
        parameters: {
          grain: 'week'
        },
        attributes: {
          displayName: 'Date'
        }
      },
      {
        type: 'dimension',
        field: 'os',
        parameters: {
          field: 'id'
        },
        attributes: {
          displayName: 'Operating System'
        }
      },
      {
        type: 'dimension',
        field: 'os',
        parameters: {
          field: 'desc'
        },
        attributes: {
          displayName: 'Operating System'
        }
      },
      {
        type: 'metric',
        field: 'uniqueIdentifier',
        parameters: {},
        attributes: {
          displayName: 'Unique Identifiers'
        }
      },
      {
        type: 'metric',
        field: 'totalPageViews',
        parameters: {},
        attributes: {
          displayName: 'Total Page Views'
        }
      },
      {
        type: 'metric',
        field: 'totalPageViewsWoW',
        parameters: {},
        attributes: {
          canAggregateSubtotal: false,
          displayName: 'Total Page Views WoW'
        }
      }
    ],
    showTotals: {
      grandTotal: true
      // subtotal: 'network.dateTime(grain=week)'
    }
  };

  upsertSort(options: any) {
    this.model[0].request.set('sorts', [
      {
        type: 'metric',
        field: options.metric,
        parameters: {},
        direction: options.direction
      }
    ]);
  }

  removeSort() {
    this.model[0].request.set('sorts', []);
  }

  updateColumn(updatedColumn: TableColumn) {
    const columns = this.options.columns.map(col => {
      const sameBase = isEqual(omit(updatedColumn, 'attributes'), omit(col, 'attributes'));
      const propsToOmit = ['format', 'displayName'];
      const sameAttrs = isEqual(omit(updatedColumn.attributes, propsToOmit), omit(col.attributes, propsToOmit));

      return sameBase && sameAttrs ? updatedColumn : col;
    });
    this.options = { ...this.options, columns };
  }

  updateColumnOrder(columns: TableColumn[]) {
    this.options = { ...this.options, columns };
  }

  @action
  onUpdateReport(actionType: Parameters<Args['onUpdateReport']>[0], options: Parameters<Args['onUpdateReport']>[1]) {
    this[actionType](options);
  }

  @action
  onUpdateConfig(configUpdate: any) {
    this.options = merge({}, this.options, configUpdate);
  }
}
