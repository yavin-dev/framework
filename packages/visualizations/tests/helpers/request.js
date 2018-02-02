import Ember from 'ember';
import Interval from 'navi-core/utils/classes/interval';

const { String: { classify }, A } = Ember;

/**
 * @function buildTestRequest
 * @param {Array} metrics - array of metrics
 * @param {Array} dimensions - array of dimensions
 * @returns {Object} request object
 */
export function buildTestRequest(metrics=[], dimensions=[], intervals = [{ end: 'current', start: 'P7D' }], timeGrain='day') {
  return {
    logicalTable: { timeGrain: { name: timeGrain} },
    metrics: metrics.map( m => {
      return { metric: { name: m, longName: classify(m), category: 'category'} };
    }),
    dimensions: dimensions.map(d => {
      return { dimension: { name: d, longName: classify(d) } };
    }),
    intervals: A(intervals.map(interval => (
      { interval: Interval.parseFromStrings(interval.start, interval.end) }
    )))
  };
}
