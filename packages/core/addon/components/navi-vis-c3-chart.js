/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Extend c3 to listen to incoming resize events
 * Usage:
 * {{navi-vis-c3-chart
 *   classNames=classNames
 *   data=dataConfig
 *   dataSelection=dataSelectionConfig // Promise which resolves to anomalous data
 *   axis=axisConfig
 *   grid=gridConfig
 *   legend=legendConfig
 *   point=pointConfig
 *   tooltip=tooltipConfig
 *   containerComponent=container
 *  }}
 */
import { next, scheduleOnce } from '@ember/runloop';
import { assign } from '@ember/polyfills';
import { set, getProperties, get, computed } from '@ember/object';
import C3Chart from 'ember-c3/components/c3-chart';
import c3 from 'c3';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import $ from 'jquery';

export default C3Chart.extend({
  /**
   * @property {Service} metricName
   */
  metricName: service(),

  /**
   * @property {Array} classNames
   */
  classNames: ['navi-vis-c3-chart'],

  /**
   * @property {Object} config
   * @private
   * @override https://github.com/Glavin001/ember-c3/blob/v0.1.7/addon/components/c3-chart.js
   */
  _config: computed(
    'data',
    'axis',
    'regions',
    'bar',
    'pie',
    'donut',
    'gauge',
    'grid',
    'legend',
    'tooltip',
    'subchart',
    'zoom',
    'point',
    'line',
    'area',
    'size',
    'padding',
    'color',
    'transition',
    function() {
      var self = this;
      var c = self.getProperties([
        'data',
        'axis',
        'regions',
        'bar',
        'pie',
        'donut',
        'gauge',
        'grid',
        'legend',
        'tooltip',
        'subchart',
        'zoom',
        'point',
        'line',
        'area',
        'size',
        'padding',
        'color',
        'transition'
      ]);

      A(['oninit', 'onrendered', 'onmouseover', 'onmouseout', 'onresize', 'onresized']).forEach(function(eventname) {
        c[eventname] = function() {
          if (!self.get('isDestroyed') && !self.get('isDestroying')) {
            self.sendAction(eventname, this);
          }
        };
      });

      c.bindto = self.$().get(0);
      return c;
    }
  ),

  /**
   * Fires when the `data` property updates
   *
   * @method dataDidChange
   * @override
   */
  dataDidChange() {
    // Add custom classes to each data series for easier reference and coloring
    let { data, dataClasses } = getProperties(this, 'data', 'dataClasses'),
      dataWithClasses = assign({}, { classes: dataClasses }, data);

    get(this, 'chart').load(dataWithClasses);

    /*
     * select data points (if any)
     * chart.select() triggers resize internally
     */
    let dataSelection = get(this, 'dataSelection');
    if (dataSelection) {
      dataSelection.then(insightsData => {
        let metricName = get(this, 'metricName'),
          metrics = get(this, 'axis.y.series.config.metrics').map(metric => metricName.getDisplayName(metric)),
          dataSelectionIndices = insightsData.mapBy('index');
        get(this, 'chart').select(metrics, dataSelectionIndices);
      });
    } else {
      /*
       * need not call _resizeFunc explicity when there is data to be selected
       * otherwise the highlighted data circles are mis-aligned
       */

      //Call resize on initial render
      this._resizeFunc();
    }
  },

  /**
   * @property {Object} chart - c3 object reference
   */
  chart: computed('_config', 'c3chart', function() {
    if (!get(this, 'c3chart')) {
      let config = get(this, '_config');

      // eslint-disable-next-line ember/no-side-effects
      set(this, 'c3chart', c3.generate(config));
    }
    return get(this, 'c3chart');
  }),

  /**
   * @property {Object} map of series id to series class name
   */
  dataClasses: computed('data', function() {
    let seriesIds = A(get(this, 'chart').data()).mapBy('id');

    // Give each series a unique class
    return seriesIds.reduce((seriesToClassMap, seriesId, seriesIndex) => {
      seriesToClassMap[seriesId] = `chart-series-${seriesIndex}`;

      return seriesToClassMap;
    }, {});
  }),

  /**
   * Destroys c3 chart
   *
   * @method didUpdateAttrs
   * @private
   * @returns {Void}
   */
  _teardownChart() {
    set(this, 'c3chart', null);
  },

  /**
   * Called when the attributes passed into the component have been updated
   *
   * @method didUpdateAttrs
   * @override
   */
  didUpdateAttrs() {
    this._super(...arguments);

    this._teardownChart();
    this.dataDidChange();
  },

  /**
   * Resize the chart
   *
   * @method _resizeFunc
   * @private
   */
  _resizeFunc() {
    // Fill the parent container
    if (!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
      this.$().css('max-height', '100%');
      this.$().css('min-height', '100%');

      get(this, 'chart').resize();
    }
  },

  didInsertElement() {
    //load data
    this.dataDidChange();

    // Call resize on initial render
    next(this, '_resizeFunc');

    // Call resize on resize event
    let container = $(get(this, 'containerComponent.element'));
    if (container.length) {
      container.on('resizestop.navi-vis-c3-chart', () => {
        scheduleOnce('afterRender', this, '_resizeFunc');
      });
    }
  },

  willDestroyElement() {
    this._super(...arguments);

    let container = $(get(this, 'containerComponent.element'));
    if (container.length) {
      container.off('.navi-vis-c3-chart');
    }

    this._teardownChart();
  }
});
