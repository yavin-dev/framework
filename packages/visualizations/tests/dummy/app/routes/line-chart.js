import Ember from "ember";

export default Ember.Route.extend({
  model(){
    return Ember.RSVP.resolve(
      Ember.A([
        {
          request: {
            metrics: [
              "uniqueIdentifier",
              "totalPageViews",
              "revenue(currency=USD)"
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
                "totalPageViews": 3072620639,
                "revenue(currency=USD)": 1421982310.09000
              },
              {
                "dateTime": "2015-12-21 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 172724594,
                "totalPageViews": 3697156058,
                "revenue(currency=USD)": 2252948122.21000
              },
              {
                "dateTime": "2015-12-28 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 183380921,
                "totalPageViews": 4024700302,
                "revenue(currency=USD)": 2104188223.24000
              },
              {
                "dateTime": "2016-01-11 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 183206656,
                "totalPageViews": 4088487125,
                "revenue(currency=USD)": 2290494122.96000
              },
              {
                "dateTime": "2016-01-18 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 183380921,
                "revenue(currency=USD)": 1124124124.66000
              },
              {
                "dateTime": "2016-01-25 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "totalPageViews": 3950276031,
                "revenue(currency=USD)": 2032578202.20000
              },
              {
                "dateTime": "2016-02-01 00:00:00.000",
                "age|id": "-3",
                "age|desc": "All Other",
                "uniqueIdentifier": 172724594,
                "totalPageViews": 3697156058,
                "revenue(currency=USD)": 1250391422.72000
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
                "totalPageViews": 3072620639,
                "revenue(currency=USD)": 1082313292.10000
              }
            ]
          }
        }
      ])
    );
  }
});
