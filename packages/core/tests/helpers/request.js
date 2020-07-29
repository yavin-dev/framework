import { classify } from '@ember/string';
import { A } from '@ember/array';
import Interval from 'navi-core/utils/classes/interval';
import { canonicalizeMetric, parseMetricName } from 'navi-data/utils/metric';

/**
 * @function buildTestRequest
 * @param {Array} metrics - array of metrics
 * @param {Array} dimensions - array of dimensions
 * @param {Array} intervals - (optional) list of intervals
 * @param {string} timeGrain - (optional) timegrain
 * @returns {Object} request object
 */
export function buildTestRequest(
  metrics = [],
  dimensions = [],
  intervals = [{ end: 'current', start: 'P7D' }],
  timeGrain = 'day'
) {
  return {
    logicalTable: { timeGrain },
    metrics: metrics.map(m => {
      if (typeof m === 'string') {
        let metricObj = parseMetricName(m);

        metricObj.toJSON = () => {
          return {
            metric: metricObj.metric,
            parameters: metricObj.parameters
          };
        };

        return metricObj;
      } else if (typeof m === 'object' && m.metric && m.parameters) {
        return {
          metric: {
            id: m.metric,
            name: classify(m.metric),
            category: 'category'
          },
          canonicalName: canonicalizeMetric(m),
          parameters: m.parameters,
          toJSON() {
            return {
              metric: m.metric,
              parameters: m.parameters
            };
          }
        };
      }
    }),
    dimensions: dimensions.map(d => {
      return { dimension: { id: d, name: classify(d) } };
    }),
    intervals: A(
      intervals.map(interval => ({
        interval: Interval.parseFromStrings(interval.start, interval.end)
      }))
    )
  };
}

export function buildApexTestRequest(
  metrics = [],
  dimensions = [],
  intervals = [{ end: 'current', start: 'P7D' }],
  timeGrain = 'day'
) {
  return {
    metrics: {
      content: metrics.map(item => {
        return {
          metric: {
            id: item
          }
        };
      })
    },
    dimensions: {
      content: dimensions.map(item => {
        return {
          dimension: {
            id: item
          }
        };
      })
    },
    logicalTable: { timeGrain },
    intervals: A(
      intervals.map(interval => ({
        interval: Interval.parseFromStrings(interval.start, interval.end)
      }))
    )
  };
}
