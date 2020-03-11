import config from 'ember-get-config';

export const Host = config.navi.dataSources[0].uri;

export const MetricOne = {
  category: 'category',
  id: 'metricOne',
  name: 'Metric One'
};

export const MetricTwo = {
  category: 'category',
  id: 'metricTwo',
  name: 'Metric Two'
};

export const MetricThree = {
  category: 'category',
  id: 'metricThree',
  name: 'Metric Three'
};

export const MetricFour = {
  category: 'category',
  id: 'metricFour',
  name: 'Metric Four'
};

export const MetricFive = {
  category: 'currencyMetrics',
  id: 'metricFive',
  name: 'Metric Five',
  metricFunctionId: 'moneyMetric'
};

export const DimensionOne = {
  category: 'categoryOne',
  id: 'dimensionOne',
  name: 'Dimension One',
  cardinality: 'SMALL' // 60
  //No Fields
};

export const DimensionTwo = {
  category: 'categoryTwo',
  id: 'dimensionTwo',
  name: 'Dimension Two',
  cardinality: 'LARGE', // 6000000000
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
  id: 'dimensionThree',
  name: 'Dimension Three',
  cardinality: 'SMALL', // 700
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

export const DimensionFour = {
  category: 'categoryTwo',
  id: 'dimensionFour',
  name: 'Dimension Four',
  cardinality: 'SMALL', // 70
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

export const DimensionFive = {
  category: 'categoryTwo',
  id: 'dimensionFive',
  name: 'Dimension Five',
  cardinality: 'LARGE', // 6000000000,
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
  name: 'table1LongName',
  id: 'table1',
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
  name: 'table2LongName',
  id: 'table2',
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
    id: 'table1',
    description: 'Table1 Description',
    name: 'table1LongName',
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
    id: 'table2',
    description: 'Table2 Description',
    name: 'table2LongName',
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

export const Tables2 = [
  {
    id: 'table3',
    description: 'Table3 Description',
    name: 'table3DisplayName',
    category: 'General',
    timeGrains: [
      {
        name: 'day',
        description: 'The table3 day grain',
        metrics: [MetricThree],
        retention: 'P24M',
        longName: 'Day',
        dimensions: [DimensionFour, DimensionFive]
      }
    ]
  },
  {
    id: 'table4',
    description: 'Table4 Description',
    name: 'table4DisplayName',
    category: 'General',
    timeGrains: [
      {
        name: 'week',
        description: 'The table4 week grain',
        metrics: [MetricFour],
        retention: 'P24M',
        longName: 'Day',
        dimensions: [DimensionFour, DimensionFive]
      }
    ]
  },
  {
    id: 'table5',
    description: 'Table5 Description',
    name: 'table5DisplayName',
    category: 'General',
    timeGrains: []
  }
];

export const MetricFunctionMoneyMetric = {
  id: 'moneyMetric',
  name: 'Money Metric',
  description: 'Money metric function',
  arguments: {
    currency: {
      defaultValue: 'USD',
      type: 'enum',
      values: [
        {
          description: 'US Dollars',
          id: 'USD'
        },
        {
          description: 'Euros',
          id: 'EUR'
        }
      ]
    }
  }
};

export const MetricFunctionAggTrend = {
  id: 'aggregationTrend',
  name: 'Aggregation Trend',
  description: 'Aggregation and Trend metric function',
  arguments: {
    aggregation: {
      defaultValue: '7DayAvg',
      values: [
        {
          id: '7DayAvg',
          description: '7 Day Average'
        },
        {
          id: '28DayAvg',
          description: '28 Day Average'
        }
      ],
      type: 'enum'
    },
    trend: {
      defaultValue: 'DO_D',
      values: [
        {
          id: 'DO_D',
          description: 'Day over Day'
        },
        {
          id: 'WO_W',
          description: 'Week over Week'
        }
      ]
    }
  }
};

export default function(index = 0) {
  const host = config.navi.dataSources[index].uri;
  this.get(`${host}/v1/tables`, function() {
    return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ tables: index > 0 ? Tables2 : Tables })];
  });

  this.get(`${host}/v1/metrics/:id`, function({ params: { id } }) {
    return [200, { 'Content-Type': 'application/json' }, JSON.stringify(METRIC_MAP[id])];
  });

  this.get(`${host}/v1/dimensions/dimensionOne`, function() {
    return [200, { 'Content-Type': 'application/json' }, JSON.stringify(DimensionOne)];
  });

  this.get(`${host}/v1/metricFunctions/moneyMetric`, function() {
    return [200, { 'Content-Type': 'application/json' }, JSON.stringify(MetricFunctionMoneyMetric)];
  });

  this.get(`${host}/v1/metricFunctions/aggregationTrend`, function() {
    return [200, { 'Content-Type': 'application/json' }, JSON.stringify(MetricFunctionAggTrend)];
  });
}

const METRIC_MAP = {
  metricOne: MetricOne,
  metricTwo: MetricTwo,
  metricThree: MetricThree,
  metricFour: MetricFour
};
