/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

//metadata
import tableModels from './fixtures/metadata-tables';
import timeGrainModels from './fixtures/metadata-time-grains';
import dimModels from './fixtures/metadata-dimensions';
import metricModels from './fixtures/metadata-metrics';

/**
 * Method to configure metadata endpoints
 */
export default function() {
  /**
   * /tables endpoint
   */
  this.get('/tables', (db, req) => {
    let tables = tableModels;

    if (req.queryParams.format === 'fullview') {
      tables = tables.map(table => {
        let timeGrains = timeGrainModels.map(timeGrain => {
          return Object.assign({}, timeGrain, { metrics: metricModels }, { dimensions: dimModels });
        });

        return Object.assign({}, table, { timeGrains });
      });
    }
    return { tables };
  });
}
