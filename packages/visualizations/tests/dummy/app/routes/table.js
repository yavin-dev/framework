import Ember from 'ember';
import _ from 'lodash';

const MOCK_ROWS = [
  {
    "dateTime": "2016-05-30 00:00:00.000",
    "os|id": "All Other",
    "os|desc": "All Other",
    "uniqueIdentifier": undefined,
    "totalPageViews": 3669828357,
    "totalPageViewsWoW": undefined
  },
  {
    "dateTime": "2016-05-31 00:00:00.000",
    "os|id": "Android",
    "os|desc": "Lorem ipsum dolor sit amet, laudem tamquam nusquam eum an. Consul corpora eam ad, iusto labore eu vix. Errem sapientem in per. Mei no quot dicat. Eos ludus accumsan an.",
    "uniqueIdentifier": 183206656,
    "totalPageViews": 4088487125,
    "totalPageViewsWoW": -9.1
  },
  {
    "dateTime": "2016-06-01 00:00:00.000",
    "os|id": "BlackBerry",
    "os|desc": "BlackBerry OS",
    "uniqueIdentifier": 0.00,
    "totalPageViews": 4024700302,
    "totalPageViewsWoW": 0.00
  },
  {
    "dateTime": "2016-06-02 00:00:00.000",
    "os|id": "ChromeOS",
    "os|desc": "Chrome OS",
    "uniqueIdentifier": 180559793,
    "totalPageViews": 3950276031,
    "totalPageViewsWoW": -1.2
  },
  {
    "dateTime": "2016-06-03 00:00:00.000",
    "os|id": "Firefox",
    "os|desc": "Firefox OS",
    "uniqueIdentifier": 172724594,
    "totalPageViews": 3697156058,
    "totalPageViewsWoW": -0.9
  }
];

export default Ember.Route.extend({
  model(){
    let rows = Ember.A();

    //20k rows
    for(let i = 0; i < 4000; i++) {
      rows.pushObjects(_.cloneDeep(MOCK_ROWS));
    }

    let meta = {
      pagination: {
        numberOfResults: rows.length*2
      }
    };

    return Ember.RSVP.resolve(
      Ember.A([
        {
          request: {
            dimensions: [ {dimension:'os'} ],
            metrics: [
              {metric: 'uniqueIdentifier'},
              {metric: 'totalPageViews'}
            ],
            logicalTable: {
              table: 'network',
              timeGrain: 'week'
            }
          },
          response: {
            rows,
            meta
          }
        }
      ])
    );
  }
});
