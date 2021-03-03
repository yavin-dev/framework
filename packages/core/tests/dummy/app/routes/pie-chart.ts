import { A } from '@ember/array';
import { resolve } from 'rsvp';
import { inject as service } from '@ember/service';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
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
                cid: 'cid_network.dateTime(grain=day)',
                field: 'network.dateTime',
                parameters: { grain: 'day' },
                type: 'timeDimension',
                source: 'bardOne',
              },
              {
                cid: 'cid_uniqueIdentifier',
                field: 'uniqueIdentifier',
                parameters: {},
                type: 'metric',
                source: 'bardOne',
              },
              {
                cid: 'cid_totalPageViews',
                field: 'totalPageViews',
                parameters: {},
                type: 'metric',
                source: 'bardOne',
              },
              {
                cid: 'cid_revenue',
                field: 'revenue',
                parameters: {},
                type: 'metric',
                source: 'bardOne',
              },
              {
                cid: 'cid_age(field=desc)',
                field: 'age',
                parameters: { field: 'desc' },
                type: 'dimension',
                source: 'bardOne',
              },
            ],
            filters: [
              {
                field: 'network.dateTime',
                parameters: { grain: 'day' },
                operator: 'bet',
                type: 'timeDimension',
                values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
                source: 'bardOne',
              },
            ],
            sorts: [],
            limit: null,
            dataSource: 'bardOne',
            table: 'network',
          }),
          response: NaviFactResponse.create({
            rows: [
              {
                'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
                'age(field=desc)': 'All Other',
                uniqueIdentifier: 155191081,
                totalPageViews: 3072620639,
                revenue: 1240857.2341,
              },
              {
                'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
                'age(field=desc)': 'under 13',
                uniqueIdentifier: 55191081,
                totalPageViews: 2072620639,
                revenue: 3221482.09842,
              },
              {
                'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
                'age(field=desc)': '13 - 25',
                uniqueIdentifier: 55191081,
                totalPageViews: 2620639,
                revenue: 4432134.37921,
              },
              {
                'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
                'age(field=desc)': '25 - 35',
                uniqueIdentifier: 55191081,
                totalPageViews: 72620639,
                revenue: 1231132.42839,
              },
              {
                'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
                'age(field=desc)': '35 - 45',
                uniqueIdentifier: 55191081,
                totalPageViews: 72620639,
                revenue: 4421322.77384,
              },
            ],
          }),
        },
      ])
    );
  },
});
