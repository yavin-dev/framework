/*
GIVEN:
  Request:
  {
    dimensions: [{ dimension: { id: string, name: string }}],
    intervals: [{ start: timeString, end: timeString }],
    logicalTable: { timeGrain: string },
    metric: [ string ]
  }
  Response Rows:
  [
    {
      dateTime: timeString,
      dimension|description: string,
      dimension|id: string,
      metric: number
    },
    ...
  ]
RETURNS:
  {
    labels: ['dimension or time labels']
    series: [{ name: 'metric', data: [#] }]
  }
*/
export function shapeData(request, rows) {
  // if there is no dimension in the request, it must be metric versus time
  let labelType = 'dateTime';
  if (request.hasOwnProperty('dimensions')) {
    // TODO: currently assumes one dimension, make multi-dimensional
    labelType = request.dimensions[0].dimension + '|desc';
  }
  // scaffold each of the metrics
  const series = request.metrics.map(item => {
    return { name: item.metric, data: [] };
  });
  // generate labels and populate data for each metric
  let labels = rows.map(row => {
    series.forEach(dataSet => {
      let num = row[dataSet.name];
      // if row has no data for this metric, set to null
      if (num === undefined) {
        num = null;
      }
      dataSet.data.push(num);
    });
    return row[labelType];
  });
  return { labels: labels, series: series };
}
