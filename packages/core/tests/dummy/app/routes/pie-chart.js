import { A } from '@ember/array';
import { resolve } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return resolve(
      A([
        {
          request: {
            metrics: ['uniqueIdentifier', 'totalPageViews', 'revenue'],
            logicalTable: {
              timeGrain: 'day'
            },
            intervals: [
              {
                start: '2015-12-14 00:00:00.000',
                end: '2015-12-15 00:00:00.000'
              }
            ],
            dimensions: [
              {
                dimension: {
                  id: 'age',
                  name: 'Age'
                }
              }
            ]
          },
          response: {
            rows: [
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '-3',
                'age|description': 'All Other',
                uniqueIdentifier: 155191081,
                totalPageViews: 3072620639,
                revenue: 1240857.2341
              },
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '1',
                'age|description': 'under 13',
                uniqueIdentifier: 55191081,
                totalPageViews: 2072620639,
                revenue: 3221482.09842
              },
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '2',
                'age|description': '13 - 25',
                uniqueIdentifier: 55191081,
                totalPageViews: 2620639,
                revenue: 4432134.37921
              },
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '3',
                'age|description': '25 - 35',
                uniqueIdentifier: 55191081,
                totalPageViews: 72620639,
                revenue: 1231132.42839
              },
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '4',
                'age|description': '35 - 45',
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
