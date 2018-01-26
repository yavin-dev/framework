import Ember from "ember";

export default Ember.Route.extend({
  model(){
    return Ember.RSVP.resolve(
      Ember.A([
        {
          request: {
            metrics: [
              "uniqueIdentifier",
              "totalPageViews"
            ],
            intervals: [
              {
                start: "2015-12-14 00:00:00.000",
                end: "2016-02-22 00:00:00.000"
              }
            ],
            logicalTable: {
              timeGrain: "week"
            }
          },
          response: {
            rows: [
              {
                "dateTime": "2015-12-14 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 155191081,
                "totalPageViews": 3072620639
              },
              {
                "dateTime": "2015-12-21 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 172724594,
                "totalPageViews": 3697156058
              },
              {
                "dateTime": "2015-12-28 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 183380921,
                "totalPageViews": 4024700302
              },
              {
                "dateTime": "2016-01-11 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 183206656,
                "totalPageViews": 4088487125
              },
              {
                "dateTime": "2016-01-18 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 183380921,
              },
              {
                "dateTime": "2016-01-25 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "totalPageViews": 3950276031
              },
              {
                "dateTime": "2016-02-01 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 172724594,
                "totalPageViews": 3697156058
              },
              {
                "dateTime": "2016-02-08 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 152298735,
                "totalPageViews": 3008425744
              },
              {
                "dateTime": "2016-02-15 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 155191081,
                "totalPageViews": 3072620639
              }
            ]
          }
        }
      ])
    );
  }
});
