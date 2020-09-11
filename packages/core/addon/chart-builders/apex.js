/*
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { getRequestDimensions, getRequestMetrics } from 'navi-core/utils/chart-data';
import Interval from 'navi-core/utils/classes/interval';
import DateUtils from 'navi-core/utils/date';
import moment from 'moment';
import { formatDateForGranularity } from 'navi-core/helpers/format-date-for-granularity';
import dateTime from './date-time';

/**
 * @typedef {object} requestType
 * @property {array} dimensions - the dimensions of the data
 * @property {array} intervals - the time interval of the data
 * @property {object} logicalTable - the granularity of the time intervals of the data
 * @property {array} metrics - the metrics of the data
 */

/**
 * @typedef {object} returnType
 * @property {array} labels - the labels to be displayed on the chart (if applicable)
 * @property {array} series - the metric series containing data
 */

/**
 * shapes data into apex-friendly format
 * @param {requestType} request
 * @param {array} rows
 * @returns {returnType}
 */
export function normalize(request, rows) {
  let labelTypes = ['dateTime'];
  if (request.dimensions.length > 0) {
    labelTypes = request.dimensions.map(item => {
      return item.dimension + '|desc';
    });
  }
  // scaffold each of the metrics
  const series = request.metrics.map(item => {
    return { name: canonicalizeMetric(item), data: [] };
  });
  let labels = [];
  // generate labels and populate data for each metric
  rows.forEach(row => {
    series.forEach(dataSet => {
      let num = row[dataSet.name];
      // if row has no data for this metric, set to null
      if (num === undefined) {
        num = null;
      }
      dataSet.data.push(Number(num));
    });
    labels.push(labelTypes.map(labelType => row[labelType]).join(', '));
  });
  return { labels: labels, series: series };
}

function determineTypes(request) {
  let overTime = false;
  if (overTime) {
    if (getRequestDimensions(request).length === 0) {
      return { labelType: 'time', seriesType: 'metric' };
    } else {
      return { labelType: 'time', seriesType: 'dimension' };
    }
  } else {
    if (getRequestDimensions(request).length === 0) {
      return { labelType: 'metric', seriesType: 'metric' };
    } else {
      return { labelType: 'dimension', seriesType: 'metric' };
    }
  }
}

function makeLegible(labelNames, labelType, timeGrain = 'day') {
  // dimension-based labels just need to be joined
  if (labelType === 'dimension') {
    return labelNames.map(labelName => {
      return labelName.join(', ');
    });
  }
  // time-based labels need to be formatted according to time-grain
  else if (labelType === 'time') {
    return labelNames.map(labelName => formatDateForGranularity(labelName[0], timeGrain));
  }
  // metric-based labels do not need modification
  else {
    return labelNames;
  }
}

/**
 * @method getLabels
 * @param {object} request - the request from which the labels are made
 * @param {object} rows  - the rows of data from the response
 * @param {string} labelType - the type of label (dimension, metric, or time)
 */
export function getLabels(request, rows, labelType = '', humanReadable = true) {
  if (labelType === '') {
    labelType = determineTypes(request).labelType;
  }
  let labelIDs = [];
  let labelNames = [];
  // handle dimension-based labels
  if (labelType === 'dimension') {
    labelIDs = getRequestDimensions(request).map(dimension => {
      return dimension + '|desc';
    });
    rows.forEach(row => {
      labelNames.push(labelIDs.map(labelID => row[labelID]));
    });
  }
  // handle metric-based labels
  else if (labelType === 'metric') {
    labelIDs = getRequestMetrics(request).map(labelID => canonicalizeMetric(labelID));
    labelNames = ['metric'];
  }
  // handle time-based labels
  else if (labelType === 'time') {
    labelIDs = ['dateTime'];
    labelNames = DateUtils.getDatesForInterval(
      Interval.parseFromStrings(request.intervals?.[0]?.start, request.intervals?.[0]?.end),
      request.logicalTable.timeGrain
    ).map(date => [moment(date).format(DateUtils.API_DATE_FORMAT_STRING)]);
  }
  // no other label types are permitted
  else {
    console.error('Error: Data labels must be of type "dimension," "metric," or "time"');
  }
  if (humanReadable) {
    return makeLegible(labelNames, labelType, request.logicalTable.timeGrain);
  }
  return { ids: labelIDs, names: labelNames };
}

/**
 * @method getTimeLabelMetricSeries
 * @param {object} request - the data request
 * @param {object} rows  - the rows of data from the response
 * @param {object} labels - the labels that match the data
 */
function getTimeLabelMetricSeries(request, rows) {
  const timeGrain = request.logicalTable.timeGrain;
  let dates = DateUtils.getDatesForInterval(
    Interval.parseFromStrings(request.intervals?.[0]?.start, request.intervals?.[0]?.end),
    timeGrain
  ).map(date => moment(date).format(DateUtils.API_DATE_FORMAT_STRING));
  let series = getRequestMetrics(request).map(labelID => {
    return { name: canonicalizeMetric(labelID), data: [] };
  });
  dates.forEach(date => {
    const labelRow = rows.filter(row => {
      return row[dateTime] === date;
    })?.[0];
    series.forEach(seri => {
      seri.data.push(labelRow[seri.name] ? labelRow[seri.name] : null);
    });
  });
  return { labels: dates.map(date => formatDateForGranularity(date, timeGrain)), series: series };
}

/**
 * @method _normalize
 * @param {object} request - the request from which the data was fetched
 * @param {array} rows - the rows of data from the response
 * @param {string} labelType - the type of label (dimension, metric, or time)
 * @param {string} seriesType - the type of series (dimension or metric)
 */
export function _normalize(request, rows, labelType, seriesType) {
  // TODO: refactor this (interpolate label/series type, handle each of four pairs seperately)
  // in progress
  let { ids: labelIDs, names: labelNames } = getLabels(request, rows, labelType, false);
  let seriesIDs = [];
  let seriesNames = [];
  // derive names of dimension-based series
  if (seriesType === 'dimension') {
    seriesIDs = getRequestDimensions(request).map(dimension => {
      return dimension + '|desc';
    });
    // get unique dimension-field names
    rows.forEach(row => {
      // determine this row's dimension names
      const rowSeriesName = seriesIDs.map(seriesID => row[seriesID]).join(', ');
      // if that name does not yet exist in seriesNames, add it
      if (!seriesNames.includes(rowSeriesName)) {
        seriesNames.push(rowSeriesName);
      }
    });
  }
  // derive names of metric-based series
  else if (seriesType === 'metric') {
    seriesIDs = getRequestMetrics(request).map(seriesID => canonicalizeMetric(seriesID));
    seriesNames = seriesIDs;
  }
  // no other series types are permitted
  else {
    console.error('Error: Data series must be of type "dimension" or "metric"');
  }
  // scaffold the series
  let series = seriesNames.map(seriesName => {
    return { name: seriesName, data: [] };
  });
  if (!(seriesType === 'metric' && labelType === 'metric')) {
    labelNames.forEach((labelName, index) => {
      // find the rows that match this label
      const labelRows = rows.filter(row => {
        // for metric-based labels, the row must have the metric property
        if (labelType === 'metric') {
          let matches = false;
          labelIDs.forEach(labelID => {
            matches = matches || row.hasOwnProperty(labelID);
          });
          return matches;
        }
        // for dimension- and time- based labels, the row's labelID property must match the label name
        else {
          let matches = true;
          labelIDs.forEach((labelID, labelIndex) => {
            console.log(row[labelID]);
            console.log(labelName[labelIndex]);
            matches = matches && row[labelID] === labelName[labelIndex];
          });
          return matches;
        }
      });
      console.log(labelRows);
      labelRows.forEach(labelRow => {
        // push data to dimension-based series
        if (seriesType === 'dimension') {
          // find the series that this row belongs too
          const foundSeries = series.find(seri => {
            const seriesName = seri.name;
            let rowName = seriesIDs.map(seriesID => labelRow[seriesID]).join(', ');
            return seriesName === rowName;
          });
          // determine the value presented by this row
          const val = labelRow[canonicalizeMetric(getRequestMetrics(request)[0])];
          if (foundSeries) {
            foundSeries.data.push(val ? Number(val) : null);
          }
        }
        // push data to metric-based series
        else if (seriesType === 'metric') {
          seriesIDs.forEach((seriesID, seriesIndex) => {
            const val = labelRow[seriesID];
            series[seriesIndex].data.push(val ? Number(val) : null);
          });
        }
        // no other series types are permitted
        else {
          console.error('Error: Data series must be of type "dimension" or "metric"');
        }
      });
      // make sure that all series have the same length data, in case labelRows weren't found
      series.forEach(seri => {
        if (seri.data.length !== index + 1) {
          seri.data.push(null);
        }
      });
    });
  } else {
    seriesIDs.forEach((seriesID, seriesIndex) => {
      const val = rows[0][seriesID];
      series[seriesIndex].data.push(val ? Number(val) : null);
    });
  }
  labelNames = makeLegible(labelNames, labelType, request.logicalTable.timeGrain);
  return { labels: labelNames, series: series };
}
