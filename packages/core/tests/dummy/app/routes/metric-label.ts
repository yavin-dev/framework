import { A } from '@ember/array';
import Route from '@ember/routing/route';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

const row: Record<string, number> = {
  bottles: 1000000,
  hp: 12,
  magic: 14,
  rupees: 3600100,
  arrows: 9999999999,
};

export default class MetricLabelRoute extends Route {
  makeModel(column: Parameters<RequestFragment['addColumn']>[0]) {
    const request = this.store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [column],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
    });

    return A([
      {
        request,
        response: {
          rows: [{ [column.field]: row[column.field] }],
        },
      },
    ]);
  }

  model() {
    return {
      bottle: this.makeModel({
        type: 'metric',
        field: 'bottles',
        parameters: {},
        alias: "Glass Bottles of the ranch's finest pasteurized whole milk!!!!!!!",
        source: 'bardOne',
      }),
      hp: this.makeModel({ type: 'metric', field: 'hp', parameters: {}, alias: 'Hit Points (HP)', source: 'bardOne' }),
      magic: this.makeModel({
        type: 'metric',
        field: 'magic',
        parameters: {},
        alias: 'Magic Points (MP)',
        source: 'bardOne',
      }),
      rupees: this.makeModel({ type: 'metric', field: 'rupees', parameters: {}, alias: 'Rupees', source: 'bardOne' }),
      arrows: this.makeModel({ type: 'metric', field: 'arrows', parameters: {}, alias: 'Arrows', source: 'bardOne' }),
    };
  }
}
