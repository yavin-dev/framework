import { resolve } from 'rsvp';
import { A } from '@ember/array';
import Route from '@ember/routing/route';
//@ts-ignore
import { cloneDeep } from 'lodash-es';
import { inject as service } from '@ember/service';
import Store from 'ember-data/store';

const MOCK_ROWS = [
  {
    'network.dateTime(grain=week)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'All Other',
    'os(field=desc)': 'All Other',
    uniqueIdentifier: undefined,
    totalPageViews: 3669828357,
    totalPageViewsWoW: undefined
  },
  {
    'network.dateTime(grain=week)': '2016-05-31 00:00:00.000',
    'os(field=id)': 'Android',
    'os(field=desc)':
      'Lorem ipsum dolor sit amet, laudem tamquam nusquam eum an. Consul corpora eam ad, iusto labore eu vix. Errem sapientem in per. Mei no quot dicat. Eos ludus accumsan an.',
    uniqueIdentifier: 183206656,
    totalPageViews: 4088487125,
    totalPageViewsWoW: -9.1
  },
  {
    'network.dateTime(grain=week)': '2016-06-01 00:00:00.000',
    'os(field=id)': 'BlackBerry',
    'os(field=desc)': 'BlackBerry OS',
    uniqueIdentifier: 0.0,
    totalPageViews: 4024700302,
    totalPageViewsWoW: 0.0
  },
  {
    'network.dateTime(grain=week)': '2016-06-02 00:00:00.000',
    'os(field=id)': 'ChromeOS',
    'os(field=desc)': 'Chrome OS',
    uniqueIdentifier: 180559793,
    totalPageViews: 3950276031,
    totalPageViewsWoW: -1.2
  },
  {
    'network.dateTime(grain=week)': '2016-06-03 00:00:00.000',
    'os(field=id)': 'Firefox',
    'os(field=desc)': 'Firefox OS',
    uniqueIdentifier: 172724594,
    totalPageViews: 3697156058,
    totalPageViewsWoW: -0.9
  }
];

export default class TableRoute extends Route {
  @service store!: Store;
  model() {
    let rows = A();

    //20k rows
    for (let i = 0; i < 4000; i++) {
      rows.pushObjects(A(cloneDeep(MOCK_ROWS)));
    }

    let meta = {
      pagination: {
        numberOfResults: rows.length
      }
    };

    return resolve(
      A([
        {
          request: this.store.createFragment('bard-request-v2/request', {
            table: null,
            columns: [
              {
                type: 'timeDimension',
                field: 'network.dateTime',
                parameters: { grain: 'week' },
                alias: null,
                source: 'bardOne'
              },
              { type: 'dimension', field: 'os', parameters: { field: 'id' }, alias: null, source: 'bardOne' },
              { type: 'dimension', field: 'os', parameters: { field: 'desc' }, alias: null, source: 'bardOne' },
              { type: 'metric', field: 'uniqueIdentifier', parameters: {}, alias: null, source: 'bardOne' },
              { type: 'metric', field: 'totalPageViews', parameters: {}, alias: null, source: 'bardOne' },
              { type: 'metric', field: 'totalPageViewsWoW', parameters: {}, alias: null, source: 'bardOne' }
            ],
            filters: [],
            sorts: [],
            limit: null,
            dataSource: 'bardOne',
            requestVersion: '2.0'
          }),
          response: {
            rows,
            meta
          }
        }
      ])
    );
  }
}
