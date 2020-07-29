/*
GIVEN:
  Request:
  {
    dimensions: [{ dimension: string }],
    intervals: [{ start: timeString, end: timeString }],
    logicalTable: { timeGrain: string },
    metrics: [{ metric: string }, { metric: string }]
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
    labels: ['dimension or time labels', ...]
    series: [{ name: 'metric', data: [#, ...] }]
  }
*/
export function shapeData(request, rows) {
  // determine the type of labels for the visualization
  let labelTypes = ['dateTime'];
  if (request.dimensions.length > 0) {
    labelTypes = request.dimensions.map(item => {
      return item.dimension + '|desc';
    });
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
      dataSet.data.push(Number(num));
    });
    const label = labelTypes.map(labelType => row[labelType]).join(', ');
    return label;
  });
  return { labels: labels, series: series };
}
