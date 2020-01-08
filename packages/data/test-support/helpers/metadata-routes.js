import config from 'ember-get-config';

export const Host = config.navi.dataSources[0].uri;

export const MetricOne = {
  category: 'category',
  name: 'metricOne',
  longName: 'Metric One'
};

export const MetricTwo = {
  category: 'category',
  name: 'metricTwo',
  longName: 'Metric Two'
};

export const DimensionOne = {
  category: 'categoryOne',
  name: 'dimensionOne',
  longName: 'Dimension One',
  cardinality: 60
  //No Fields
};

export const DimensionTwo = {
  category: 'categoryTwo',
  name: 'dimensionTwo',
  longName: 'Dimension Two',
  cardinality: 6000000000,
  fields: [
    {
      name: 'key',
      description: 'description',
      tags: ['primaryKey', 'display']
    },
    {
      name: 'description',
      description: 'description',
      tags: ['description', 'display']
    }
  ]
};

export const DimensionThree = {
  category: 'categoryTwo',
  name: 'dimensionThree',
  longName: 'Dimension Three',
  cardinality: 700,
  fields: [
    {
      name: 'id',
      description: 'description',
      tags: ['primaryKey', 'display']
    },
    {
      name: 'description',
      description: 'description',
      tags: ['description', 'display']
    }
  ]
};

export const TableOne = {
  description: 'Table1 Description',
  longName: 'table1LongName',
  name: 'table1',
  category: 'General',
  timeGrains: [
    {
      description: 'The table1 day grain',
      dimensionIds: ['dimensionOne', 'dimensionThree'],
      longName: 'Day',
      metricIds: ['metricOne'],
      name: 'day',
      retention: 'P24M'
    }
  ]
};

export const TableTwo = {
  description: 'Table2 Description',
  longName: 'table2LongName',
  name: 'table2',
  category: 'General',
  timeGrains: [
    {
      description: 'The table2 week grain',
      dimensionIds: ['dimensionTwo'],
      longName: 'Day',
      metricIds: ['metricTwo'],
      name: 'week',
      retention: 'P24M'
    }
  ]
};

export const Tables = [
  {
    name: 'table1',
    description: 'Table1 Description',
    longName: 'table1LongName',
    category: 'General',
    timeGrains: [
      {
        name: 'day',
        description: 'The table1 day grain',
        metrics: [MetricOne],
        retention: 'P24M',
        longName: 'Day',
        dimensions: [DimensionOne, DimensionThree]
      }
    ]
  },
  {
    name: 'table2',
    description: 'Table2 Description',
    longName: 'table2LongName',
    category: 'General',
    timeGrains: [
      {
        name: 'week',
        description: 'The table2 week grain',
        metrics: [MetricTwo],
        retention: 'P24M',
        longName: 'Day',
        dimensions: [DimensionTwo]
      }
    ]
  }
];

export default function() {
  this.get(`${Host}/v1/tables`, function() {
    return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ tables: Tables })];
  });

  this.get(`${Host}/v1/metrics/metricOne`, function() {
    return [200, { 'Content-Type': 'application/json' }, JSON.stringify(MetricOne)];
  });

  this.get(`${Host}/v1/dimensions/dimensionOne`, function() {
    return [200, { 'Content-Type': 'application/json' }, JSON.stringify(DimensionOne)];
  });
}
