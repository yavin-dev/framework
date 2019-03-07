/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import isEqual from 'lodash/isEqual';
import { validator, buildValidations } from 'ember-cp-validations';
import Interval from 'navi-core/utils/classes/interval';
import { A as arr, makeArray } from '@ember/array';
import { assert } from '@ember/debug';
import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { copy } from 'ember-copy';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import Fragment from 'ember-data-model-fragments/fragment';
import { fragment, fragmentArray } from 'ember-data-model-fragments/attributes';

const Validations = buildValidations({
  logicalTable: [
    validator('belongs-to'),
    validator('presence', {
      presence: true,
      message: 'Please select a table'
    })
  ],
  responseFormat: validator('presence', {
    presence: true,
    message: 'Please select a response format'
  }),
  dimensions: [validator('has-many')],
  filters: [
    validator('has-many'),
    validator('length', {
      min: 0,
      message: 'Filters can be empty'
    })
  ],
  metrics: [
    validator('has-many'),
    validator('length', {
      min: 1,
      message: 'At least one metric should be selected'
    })
  ],
  having: [
    validator('has-many'),
    validator('length', {
      min: 0,
      message: 'Having can be empty'
    })
  ],
  sort: [
    validator('has-many'),
    validator('length', {
      min: 0,
      message: 'Sort can be empty'
    })
  ],
  intervals: [
    validator('has-many'),
    validator('length', {
      min: 1,
      message: 'Please select a date range'
    })
  ]
});

export default Fragment.extend(Validations, {
  /* == Attributes == */
  logicalTable: fragment('bard-request/fragments/logical-table', {
    defaultValue: {}
  }),
  metrics: fragmentArray('bard-request/fragments/metric', { defaultValue: [] }),
  dimensions: fragmentArray('bard-request/fragments/dimension', {
    defaultValue: []
  }),
  filters: fragmentArray('bard-request/fragments/filter', { defaultValue: [] }),
  having: fragmentArray('bard-request/fragments/having', { defaultValue: [] }),
  sort: fragmentArray('bard-request/fragments/sort', { defaultValue: [] }),
  intervals: fragmentArray('bard-request/fragments/interval', {
    defaultValue: []
  }),
  responseFormat: DS.attr('string', { defaultValue: 'json' }),
  bardVersion: DS.attr('string', { defaultValue: 'v1' }),
  requestVersion: DS.attr('string', { defaultValue: 'v1' }),

  /**
   * @property {Service} metadataService - Bard Metadata Service
   */
  metadataService: service('bard-metadata'),

  /* == Metric == */

  /**
   * Adds a metric fragment to the metrics array if not already present
   *
   * @method addMetric
   * @param {Object} requestMetric - metric metadata model
   * @returns {Void}
   */
  addMetric(requestMetric) {
    let metrics = get(this, 'metrics'),
      metricMetadata = get(requestMetric, 'metric'),
      metricDoesntExist = isEmpty(metrics.findBy('metric', metricMetadata));

    //check if metric with parameter exists when metric hasParameters
    if (metricMetadata && get(metricMetadata, 'hasParameters')) {
      let parameters = get(requestMetric, 'parameters'),
        //filter all metrics of type `metricMetadata`
        existingMetrics = metrics.filterBy('metric', metricMetadata);

      //check if parameters in requestMetric in in the filtered metrics
      metricDoesntExist = isEmpty(existingMetrics.filter(metric => isEqual(get(metric, 'parameters'), parameters)));
    }

    if (metricDoesntExist) {
      metrics.createFragment(requestMetric);
    }
  },

  /**
   * Adds a metric model to the metrics array
   *
   * @method addRequestMetricByModel
   * @param {Object} metricModel - metric metadata model
   */
  addRequestMetricByModel(metricModel) {
    if (get(metricModel, 'hasParameters')) {
      this.addRequestMetricWithParam(metricModel);
    } else {
      this.addMetric({
        metric: metricModel
      });
    }
  },

  /**
   * Adds a metric model to the metrics array with parameter
   *
   * @method addRequestMetricWithParam
   * @param {Object} metricModel - metric metadata model
   * @param {Object} [parameters] - parameters [optional]
   */
  addRequestMetricWithParam(metricModel, parameters) {
    let requestParameters = Object.assign({}, metricModel.getDefaultParameters(), parameters);

    this.addMetric({
      metric: metricModel,
      parameters: requestParameters
    });
  },

  /**
   * Removes a metric fragment from the array
   *
   * @method removeRequestMetric
   * @param {DS.ModelFragment} requestMetric
   * @returns {DS.ModelFragment} removed metric fragment
   */
  removeRequestMetric(requestMetric) {
    return get(this, 'metrics').removeFragment(requestMetric);
  },

  /**
   * Removes all metric fragment of the specified metric model
   *
   * @method removeRequestMetricByModel
   * @param {Object} metricModel - metric metadata model
   */
  removeRequestMetricByModel(metricModel) {
    let metrics = get(this, 'metrics').filterBy('metric', metricModel);
    metrics.forEach(requestMetric => this.removeRequestMetric(requestMetric));
  },

  /**
   * Removes a metric fragment with specified param using the metric model
   *
   * @method removeRequestMetricWithParam
   * @param {Object} metricModel - metric metadata model
   * @param {Object} parameters
   * @returns removed metric fragment
   */
  removeRequestMetricWithParam(metricModel, parameters) {
    let metrics = get(this, 'metrics').filterBy('metric', metricModel),
      canonicalizedMetric = canonicalizeMetric({
        metric: get(metricModel, 'name'),
        parameters
      });

    metrics.forEach(requestMetric => {
      if (get(requestMetric, 'canonicalName') === canonicalizedMetric) {
        this.removeRequestMetric(requestMetric);
      }
    });
  },

  /**
   * Clears all the metrics from the metrics array
   *
   * @metod clearMetrics
   */
  clearMetrics() {
    get(this, 'metrics').clear();
  },

  /* == Interval == */

  /**
   * Adds a interval fragment to the array if not already present
   *
   * @method addInterval
   * @param {Interval} intervalObj
   * @returns {Void}
   */
  addInterval(intervalObj) {
    let intervals = get(this, 'intervals'),
      existingInterval = intervals.find(interval => intervalObj.isEqual(interval.get('interval')));
    if (!existingInterval) {
      intervals.createFragment({
        interval: intervalObj
      });
    }
  },

  /**
   * Removes a interval fragment from the array
   *
   * @method removeInterval
   * @param {DS.ModelFragment} intervalObj
   * @returns {DS.ModelFragment} removed interval fragment
   */
  removeInterval(intervalObj) {
    return get(this, 'intervals').removeFragment(intervalObj);
  },

  /* == Group By == */

  /**
   * Adds a dimension to the dimensions array if not already present
   *
   * @method addDimension
   * @param {Object} dimensionObj
   * @returns {Void}
   */
  addDimension(dimensionObj) {
    let dimensions = get(this, 'dimensions'),
      newDimension = get(dimensionObj, 'dimension'),
      existingDimension = dimensions.findBy('dimension', newDimension);

    if (!existingDimension) {
      dimensions.createFragment(dimensionObj);
    }
  },

  /**
   * Adds a dimension model to the dimensions array
   *
   * @method addRequestDimensionByModel
   * @param {DS.Model} dimensionModel
   */
  addRequestDimensionByModel(dimensionModel) {
    this.addDimension({
      dimension: dimensionModel
    });
  },

  /**
   * Removes a dimension from the groupBy array
   *
   * @method removeRequestDimension
   * @param {DS.ModelFragment} dimensionObj
   * @returns {DS.ModelFragment} removed dimension fragment
   */
  removeRequestDimension(dimensionObj) {
    return get(this, 'dimensions').removeFragment(dimensionObj);
  },

  /**
   * Removes a dimension fragment using the dimension model
   *
   * @method removeRequestDimensionByModel
   * @param {DS.Model} dimensionModel
   * @returns {DS.ModelFragment} the removed dimension fragment
   */
  removeRequestDimensionByModel(dimensionModel) {
    let dimensions = get(this, 'dimensions'),
      dimensionObj = dimensions.findBy('dimension', dimensionModel);
    return this.removeRequestDimension(dimensionObj);
  },

  /**
   * Clears all the dimensions from the metrics array
   *
   * @method clearDimensions
   */
  clearDimensions() {
    get(this, 'dimensions').clear();
  },

  /* == Filter == */

  /**
   * Adds a filter to the filters array unless a duplicate filter is already present
   *
   * @method addFilter
   * @param {Object} filterObj
   * @returns {Void}
   */
  addFilter(filterObj) {
    let newFilter = this.store.createFragment('bard-request/fragments/filter', {
        dimension: get(filterObj, 'dimension'),
        operator: get(filterObj, 'operator'),
        field: get(filterObj, 'field'),
        values: arr(get(filterObj, 'values'))
      }),
      filters = get(this, 'filters'),
      existingFilter = filters.find(filter => isEqual(filter.serialize(), newFilter.serialize()));

    if (!existingFilter) {
      filters.unshiftObject(newFilter);
    }
  },

  /**
   * Removes the filter from the filters array
   *
   * @method removeRequestFilter
   * @param {DS.ModelFragment} filterObj
   * @returns {DS.ModelFragment} removed filter fragment
   */
  removeRequestFilter(filterObj) {
    return get(this, 'filters').removeFragment(filterObj);
  },

  /**
   * Removes the filter from the filters array using the dimension model
   *
   * @method removeRequestFilterByDimension
   * @param {DS.Model} dimensionModel
   * @returns {DS.ModelFragment} removed filter fragment
   */
  removeRequestFilterByDimension(dimensionModel) {
    let filters = get(this, 'filters'),
      filterObj = filters.findBy('dimension', dimensionModel);
    return this.removeRequestFilter(filterObj);
  },

  /**
   * Updates the filter with the same dimension
   *
   * @method updateFilterForDimension
   * @param {DS.Model} dimension
   * @param {Object} props
   * @returns {Void}
   */
  updateFilterForDimension(dimension, props) {
    let filter = get(this, 'filters').findBy('dimension', dimension);

    assert(`${dimension.modelName} as a filter does not exist`, filter);

    filter.setProperties(props);
  },

  /* == Sort == */

  /**
   * Adds a dateTime sort to the sort array
   *
   * @method addDateTimeSort
   * @param {String} direction
   * @returns {Void}
   */
  addDateTimeSort(direction) {
    let sort = get(this, 'sort'),
      dateTimeSort = this.store.createFragment('bard-request/fragments/sort', {
        metric: this.store.createFragment('bard-request/fragments/metric', {
          metric: { name: 'dateTime' }
        }),
        direction
      });

    sort.unshiftObject(dateTimeSort);
  },

  /**
   * Updates the sort direction for the same metric
   *
   * @method updateDateTimeSort
   * @param {Object} props - contains direction property to be updated
   * @returns {Void}
   */
  updateDateTimeSort(props) {
    let sort = get(this, 'sort').findBy('metric.canonicalName', 'dateTime');

    assert(`dateTime as a sort does not exist`, sort);

    sort.setProperties(props);
  },

  /**
   * Adds a sort to the sort array if not already present
   *
   * @method addSort
   * @param {Object} sortObj
   * @returns {Void}
   */
  addSort({ metric, direction }) {
    let sort = get(this, 'sort'),
      metricName = get(metric, 'canonicalName'),
      existingSort = sort.findBy('metric.canonicalName', metricName);

    assert(`Metric: ${metricName} cannot have multiple sorts on it`, !existingSort);

    sort.createFragment({
      metric: copy(metric),
      direction
    });
  },

  /**
   * Add a sort to the sort array using the metric name
   *
   * @method addSortByMetricName
   * @param {String} metricName
   * @param {String} direction
   * @returns {Void}
   */
  addSortByMetricName(metricName, direction = 'asc') {
    let metrics = get(this, 'metrics'),
      metric = metrics.findBy('canonicalName', metricName);

    assert(`Metric with name "${metricName}" was not found in the request`, metric);

    this.addSort({
      direction,
      metric
    });
  },

  /**
   * Removes the sort from the sort array
   *
   * @method removeSort
   * @param {DS.ModelFragment} sortObj
   * @returns {DS.ModelFragment} removed sort fragment
   */
  removeSort(sortObj) {
    return get(this, 'sort').removeFragment(sortObj);
  },

  /**
   * Removes the sort from the sort array using the metric name
   *
   * @method removeSortByMetricName
   * @param {String} metricName
   * @returns {DS.ModelFragment} removed sort fragment
   */
  removeSortByMetricName(metricName) {
    let sort = get(this, 'sort'),
      sortObj = sort.findBy('metric.canonicalName', metricName);
    return this.removeSort(sortObj);
  },

  /**
   * Removes the sort from the sort array using the metric model
   *
   * @method removeSortMetricByModel
   * @param {Object} metricModel - metric metadata model
   * @returns {Void}
   */
  removeSortMetricByModel(metricModel) {
    let sorts = get(this, 'sort').filterBy('metric.metric', metricModel);
    sorts.forEach(sortMetric => this.removeSort(sortMetric));
  },

  /**
   * Removes the sort from the sort array using the metric model and parameters
   *
   * @method removeSortMetricWithParam
   * @param {Object} metricModel - metric metadata model
   * @param {Object} parameters - parameters
   * @returns {DS.ModelFragment} removed sort fragment
   */
  removeSortMetricWithParam(metricModel, parameters) {
    let canonicalizedMetric = canonicalizeMetric({
      metric: get(metricModel, 'name'),
      parameters
    });

    return this.removeSortByMetricName(canonicalizedMetric);
  },

  /**
   * Updates the sort direction for the same metric
   *
   * @method updateSortForMetric
   * @param {DS.Model} metric
   * @param {Object} props - contains direction property to be updated
   * @returns {Void}
   */
  updateSortForMetric(metric, props) {
    let metricName = get(metric, 'canonicalName'),
      sort = get(this, 'sort').findBy('metric.canonicalName', metricName);

    assert(`${metricName} as a sort does not exist`, sort);

    sort.setProperties(props);
  },

  /**
   * @method clone
   * @returns {MF.Fragment} copy of this fragment
   */
  clone() {
    let clonedRequest = this.toJSON(),
      store = this.store,
      metadataService = get(this, 'metadataService');

    return store.createFragment('bard-request/request', {
      logicalTable: store.createFragment('bard-request/fragments/logicalTable', {
        table: metadataService.getById('table', clonedRequest.logicalTable.table),
        timeGrainName: clonedRequest.logicalTable.timeGrain
      }),

      dimensions: clonedRequest.dimensions.map(dimension =>
        store.createFragment('bard-request/fragments/dimension', {
          dimension: metadataService.getById('dimension', dimension.dimension)
        })
      ),

      metrics: clonedRequest.metrics.map(metric =>
        store.createFragment('bard-request/fragments/metric', {
          metric: metadataService.getById('metric', metric.metric),
          parameters: metric.parameters
        })
      ),

      filters: clonedRequest.filters.map(filter =>
        store.createFragment('bard-request/fragments/filter', {
          dimension: metadataService.getById('dimension', filter.dimension),
          field: filter.field,
          operator: filter.operator,
          rawValues: filter.values
        })
      ),

      //clone having
      having: makeArray(clonedRequest.having).map(having =>
        store.createFragment('bard-request/fragments/having', {
          metric: store.createFragment('bard-request/fragments/metric', {
            metric: metadataService.getById('metric', having.metric.metric),
            parameters: having.metric.parameters || {}
          }),
          operator: having.operator,
          values: having.values
        })
      ),

      /*
       * Prior to adding sort feature, sort object is undefined for saved reports
       * So if undefined - an empty array is passed
       */
      sort: makeArray(clonedRequest.sort).map(sort => {
        let metric;
        if (sort.metric.metric === 'dateTime') {
          metric = store.createFragment('bard-request/fragments/metric', {
            metric: { name: 'dateTime' }
          });
        } else {
          metric = store.createFragment('bard-request/fragments/metric', {
            metric: metadataService.getById('metric', sort.metric.metric),
            parameters: sort.metric.parameters
          });
        }

        return store.createFragment('bard-request/fragments/sort', {
          metric,
          direction: sort.direction
        });
      }),

      intervals: clonedRequest.intervals.map(interval =>
        store.createFragment('bard-request/fragments/interval', {
          interval: Interval.parseFromStrings(interval.start, interval.end)
        })
      ),

      responseFormat: clonedRequest.responseFormat
    });
  },

  /* == Having == */

  /**
   * Adds a having to the having array unless a duplicate having is already present
   *
   * @method addHaving
   * @param {Object} havingObj
   * @returns {Void}
   */
  addHaving(havingObj) {
    let havings = get(this, 'having'),
      newHaving = this.store.createFragment('bard-request/fragments/having', havingObj),
      existingHaving = havings.find(having => isEqual(having.serialize(), newHaving.serialize()));

    if (!existingHaving) {
      havings.unshiftObject(newHaving);
    }
  },

  /**
   * Removes the having from the having array
   *
   * @method removeRequestHaving
   * @param {DS.ModelFragment} havingObj
   * @returns {DS.ModelFragment} removed having fragment
   */
  removeRequestHaving(havingObj) {
    return get(this, 'having').removeFragment(havingObj);
  },

  /**
   * Removes the having from the having array using the metric model
   *
   * @method removeRequestHavingByMetric
   * @param {DS.Model} metricModel
   * @returns {DS.ModelFragment} removed having fragment
   */
  removeRequestHavingByMetric(metricModel) {
    let having = get(this, 'having'),
      havingObj = having.findBy('metric.metric', metricModel);
    return this.removeRequestHaving(havingObj);
  },

  /**
   * Updates the having with the same metric
   *
   * @method updateHavingForMetric
   * @param {DS.Model} metric
   * @param {Object} props
   * @returns {Void}
   */
  updateHavingForMetric(metric, props) {
    let having = get(this, 'having').findBy('metric.metric', metric);

    assert(`${metric.modelName} as a having does not exist`, having);

    having.setProperties(props);
  }
});
