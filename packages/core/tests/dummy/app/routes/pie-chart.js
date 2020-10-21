import { A } from '@ember/array';
import { resolve } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service(),

  model() {
    return resolve(
      A([
        {
          request: this.store.createFragment('bard-request-v2/request', {
            columns: [
              {
                cid: '1',
                field: 'time',
                parameters: { grain: 'day' },
                type: 'timeDimension',
                source: 'source'
              },
              {
                cid: '2',
                field: 'uniqueIdentifier',
                parameters: {},
                type: 'metric',
                source: 'source'
              },
              {
                cid: '3',
                field: 'totalPageViews',
                parameters: {},
                type: 'metric',
                source: 'source'
              },
              {
                cid: '4',
                field: 'revenue',
                parameters: {},
                type: 'metric',
                source: 'source'
              },
              {
                cid: '5',
                field: 'age',
                parameters: { field: 'desc' },
                type: 'dimension',
                source: 'source'
              }
            ],
            filters: [
              {
                field: 'time',
                parameters: { grain: 'day' },
                operator: 'bet',
                type: 'timeDimension',
                values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
                source: 'source'
              }
            ],
            sorts: [],
            limit: null,
            dataSource: 'source',
            table: 'table'
          }),
          response: {
            rows: [
              {
                'time(grain=day)': '2015-12-14 00:00:00.000',
                // 'age(field=id)': '-3',
                'age(field=desc)': 'All Other',
                uniqueIdentifier: 155191081,
                totalPageViews: 3072620639,
                revenue: 1240857.2341
              },
              {
                'time(grain=day)': '2015-12-14 00:00:00.000',
                // 'age(field=id)': '1',
                'age(field=desc)': 'under 13',
                uniqueIdentifier: 55191081,
                totalPageViews: 2072620639,
                revenue: 3221482.09842
              },
              {
                'time(grain=day)': '2015-12-14 00:00:00.000',
                // 'age(field=id)': '2',
                'age(field=desc)': '13 - 25',
                uniqueIdentifier: 55191081,
                totalPageViews: 2620639,
                revenue: 4432134.37921
              },
              {
                'time(grain=day)': '2015-12-14 00:00:00.000',
                // 'age(field=id)': '3',
                'age(field=desc)': '25 - 35',
                uniqueIdentifier: 55191081,
                totalPageViews: 72620639,
                revenue: 1231132.42839
              },
              {
                'time(grain=day)': '2015-12-14 00:00:00.000',
                // 'age(field=id)': '4',
                'age(field=desc)': '35 - 45',
                uniqueIdentifier: 55191081,
                totalPageViews: 72620639,
                revenue: 4421322.77384
              }
            ]
          }
        }
      ])
    );
  }
});
