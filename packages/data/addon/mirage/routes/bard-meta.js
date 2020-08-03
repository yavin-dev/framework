/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import faker from 'faker';

//metadata
import tableModels from '../fixtures/bard-meta-tables';
import blockheadTableModels from '../fixtures/bard-meta-blockhead-tables';
import timeGrainModels from '../fixtures/bard-meta-time-grains';
import dimModels from '../fixtures/bard-meta-dimensions';
import metricModels from '../fixtures/bard-meta-metrics';

/**
 * Method to configure metadata endpoints
 */
export default function() {
  /**
   * unsupported metricFunctions endpoint
   */
  this.get('metricFunctions', function() {
    return [404, { 'Content-Type': 'text/plain' }, 'Resource Not Found'];
  });

  /**
   * /tables endpoint
   */
  this.get('/tables', function(db, req) {
    let isBlockhead = req.url.startsWith('https://data2');
    let tables = isBlockhead ? blockheadTableModels : tableModels;

    if (req.queryParams.format === 'fullview') {
      tables = tables.map(table => {
        let timeGrains = timeGrainModels.map(timeGrain => {
          let tableDimModels = isBlockhead ? dimModels.blockheadDims : dimModels.defaultDims;
          let defaultMetricModels = isBlockhead ? metricModels.blockheadMetrics : metricModels.defaultMetrics;

          if (table.name === 'tableC') {
            defaultMetricModels = defaultMetricModels.slice(0, 10);
          }

          if (table.name !== 'network') {
            tableDimModels = tableDimModels.concat(dimModels.highCardinalityDims);
          }

          if (timeGrain.name === 'day') {
            return Object.assign({}, timeGrain, { metrics: defaultMetricModels }, { dimensions: tableDimModels });
          } else {
            if (!isBlockhead) {
              defaultMetricModels = defaultMetricModels.concat(metricModels.dayAvgMetrics);
            }

            return Object.assign({}, timeGrain, { metrics: defaultMetricModels }, { dimensions: tableDimModels });
          }
        });

        // Setup a case where tables support different time grains
        if (table.name === 'tableB') {
          timeGrains.shift();
        }

        return Object.assign({}, table, { timeGrains });
      });
    }
    return { tables };
  });

  this.get('/dimensions/:dimension', function(db, request) {
    let dimensionName = request.params.dimension,
      dimension = dimModels.defaultDims
        .concat(dimModels.highCardinalityDims)
        .find(dimModel => dimModel.name === dimensionName);

    dimension.description = faker.lorem.sentence();
    return dimension;
  });

  this.get('/metrics/:metric', function(db, request) {
    let metricName = request.params.metric,
      metric = metricModels.defaultMetrics
        .concat(metricModels.dayAvgMetrics)
        .find(metricModel => metricModel.name === metricName);

    faker.seed(metricName.length);
    metric.description = faker.lorem.sentence();
    return metric;
  });
}
