/* eslint-disable ember/no-get */
/* eslint-disable ember/require-computed-property-dependencies */
/**
 * Copyright 2020, Yahoo Holdings Inc.
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
 *   metrics=metrics
 *  }}
 */
import { next, scheduleOnce } from '@ember/runloop';
import { assign } from '@ember/polyfills';
import { set, getProperties, computed } from '@ember/object';
import C3Chart from 'ember-c3/components/c3-chart';
import c3 from 'c3';
import { A } from '@ember/array';

export default C3Chart.extend({
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
    function () {
      const c = this.getProperties([
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
      ]);

      ['oninit', 'onrendered', 'onmouseover', 'onmouseout', 'onresize', 'onresized'].forEach((eventname) => {
        c[eventname] = () => {
          if (!this.isDestroyed && !this.isDestroying) {
            const eventAction = this.get(eventname);
            if (eventAction) {
              eventAction(this);
            }
          }
        };
      });

      c.bindto = this.element;
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

    this.chart.load(dataWithClasses);

    /*
     * select data points (if any)
     * chart.select() triggers resize internally
     */
    let dataSelection = this.dataSelection;
    if (dataSelection) {
      dataSelection.then((insightsData) => {
        const series = Object.keys(this.data.json[0]).filter((series) => series !== 'x');
        const dataSelectionIndices = insightsData.mapBy('index');
        this.chart.select(series, dataSelectionIndices);
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
  chart: computed('_config', 'c3chart', function () {
    if (!this.c3chart) {
      let config = this._config;

      // eslint-disable-next-line ember/no-side-effects
      set(this, 'c3chart', c3.generate(config));
    }
    return this.c3chart;
  }),

  /**
   * @property {Object} map of series id to series class name
   */
  dataClasses: computed('data', function () {
    let seriesIds = A(this.chart.data()).mapBy('id');

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
    if (!this.isDestroyed && !this.isDestroying) {
      this.element.style['max-height'] = '100%';
      this.element.style['min-height'] = '100%';
      this.chart.resize();
    }
  },

  getContainer() {
    const { containerComponent } = this;
    let container;
    if (typeof containerComponent === 'function') {
      container = containerComponent();
    } else {
      container = this.containerComponent?.element;
    }
    return container;
  },

  didInsertElement() {
    this._super(...arguments);

    //load data
    this.dataDidChange();

    // Call resize on initial render
    next(this, '_resizeFunc');

    const container = this.getContainer();
    // Call resize on resize event
    if (container) {
      this.handleResize = () => scheduleOnce('afterRender', this, '_resizeFunc');
      container.addEventListener('resizestop', this.handleResize);
    }
  },

  willDestroyElement() {
    this._super(...arguments);

    const container = this.getContainer();
    container?.removeEventListener('resizestop', this.handleResize);

    this._teardownChart();
  },
});
