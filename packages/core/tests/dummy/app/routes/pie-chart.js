import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.RSVP.resolve(
      Ember.A([
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
                  name: 'age',
                  longName: 'Age'
                }
              }
            ]
          },
          response: {
            rows: [
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '-3',
                'age|desc': 'All Other',
                uniqueIdentifier: 155191081,
                totalPageViews: 3072620639,
                revenue: 1240857.2341
              },
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '1',
                'age|desc': 'under 13',
                uniqueIdentifier: 55191081,
                totalPageViews: 2072620639,
                revenue: 3221482.09842
              },
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '2',
                'age|desc': '13 - 25',
                uniqueIdentifier: 55191081,
                totalPageViews: 2620639,
                revenue: 4432134.37921
              },
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '3',
                'age|desc': '25 - 35',
                uniqueIdentifier: 55191081,
                totalPageViews: 72620639,
                revenue: 1231132.42839
              },
              {
                dateTime: '2015-12-14 00:00:00.000',
                'age|id': '4',
                'age|desc': '35 - 45',
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
