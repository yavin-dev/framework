import Ember from 'ember';
import Interval from 'navi-core/utils/classes/interval';
import { canonicalizeMetric } from 'navi-data/utils/metric';

const { String: { classify }, A } = Ember;

/**
 * @function buildTestRequest
 * @param {Array} metrics - array of metrics
 * @param {Array} dimensions - array of dimensions
 * @param {Array} intervals - (optional) list of intervals
 * @param {string} timeGrain - (optional) timegrain
 * @returns {Object} request object
 */
export function buildTestRequest(metrics=[], dimensions=[], intervals = [{ end: 'current', start: 'P7D' }], timeGrain='day') {
  return {
    logicalTable: { timeGrain: { name: timeGrain} },
    metrics: metrics.map( m => {
      if(typeof m === 'string') {
        return {metric: {name: m, longName: classify(m), category: 'category'}, canonicalName: m};
      } else if(typeof m === 'object' && m.metric && m.parameters) {
        return { metric: { name: m.metric, longName: classify(m.metric), category: 'category'},
          canonicalName: canonicalizeMetric(m),
          parameters: m.parameters };
      }
    }),
    dimensions: dimensions.map(d => {
      return { dimension: { name: d, longName: classify(d) } };
    }),
    intervals: A(intervals.map(interval => (
      { interval: Interval.parseFromStrings(interval.start, interval.end) }
    )))
  };
}
