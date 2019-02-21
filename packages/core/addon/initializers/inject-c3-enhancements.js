/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { set } from '@ember/object';

import { A } from '@ember/array';

/**
 * Override c3 functions with customized logic
 */
export function initialize() {
  let c3fn = c3.chart.fn; // jshint ignore:line
  let c3infn = c3.chart.internal.fn; // jshint ignore:line

  /**
   * c3 uses opacity to hide element, but this approach can cause issues in some circumstances
   * because how svg renders elements --- the opacity 0 elment can potentially overlap and hide other elements.
   * Therefore, we need to use display property to prevent the opacity 0 element being rendered completely
   * @method show
   * @override
   */
  c3fn.show = function(targetIds, options) {
    let $$ = this.internal,
      targets;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.removeHiddenTargetIds(targetIds);
    targets = $$.svg.selectAll($$.selectorTargets(targetIds));

    targets
      .transition()
      .style('display', 'initial')
      .style('opacity', 1, 'important')
      .call($$.endall, function() {
        targets.style('opacity', null).style('opacity', 1);
      });

    if (options.withLegend) {
      $$.showLegend(targetIds);
    }

    $$.redraw({
      withUpdateOrgXDomain: true,
      withUpdateXDomain: true,
      withLegend: true
    });
  };

  /**
   * c3 uses opacity to hide element, but this approach can cause issues in some circumstances
   * because how svg renders elements --- the opacity 0 elment can potentially overlap and hide other elements.
   * Therefore, we need to use display property to prevent the opacity 0 element being rendered completely
   * @method hide
   * @override
   */
  c3fn.hide = function(targetIds, options) {
    let $$ = this.internal,
      targets;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.addHiddenTargetIds(targetIds);
    targets = $$.svg.selectAll($$.selectorTargets(targetIds));

    targets
      .transition()
      .style('opacity', 0, 'important')
      .call($$.endall, function() {
        targets.style('opacity', null).style('opacity', 0);
        targets.style('display', 'none');
      });

    if (options.withLegend) {
      $$.hideLegend(targetIds);
    }

    $$.redraw({
      withUpdateOrgXDomain: true,
      withUpdateXDomain: true,
      withLegend: true
    });
  };

  /**
   * @property {Function} gauge_minmaxformat - used to register option
   */
  c3infn.additionalConfig.gauge_minmaxformat = undefined;

  /**
   * c3 supports giving each series a user defined class,
   * but prefixes each class with `c3-target-`. Since the
   * prefix gets in the way of the user requested class,
   * this 'enhancement' removes the `c3-target-` prefix logic.
   *
   * @method classTarget
   * @override
   * @param {String} id - series id to determine class for
   * @returns {String} classes to be applied to chart elements of a given series
   */
  c3infn.classTarget = function(id) {
    let additionalClass = this.config.data_classes[id] || '';
    return this.generateClass(c3infn.CLASS.target, id) + ' ' + additionalClass;
  };

  /**
   * To better support chart tooltips, each series is given a defined `seriesIndex`,
   * which stays consistent regardless of which series are currently hidden.
   * The c3 `addName` method does something similar with series name, so
   * we can minimize code change by extending `addName` to include series index.
   *
   * @method addName
   * @override
   * @param {Object} data - object with a point of chart data to modify
   * @returns {Object} data with `name` and `seriesIndex` property filled in
   */
  const addNameSuper = c3infn.addName;
  c3infn.addName = function(data) {
    let seriesIds = A(this.data.targets).mapBy('id'),
      seriesIndex = seriesIds.indexOf(data.id);

    set(data, 'seriesIndex', seriesIndex);

    return addNameSuper.call(this, data);
  };

  /**
   * Allow mixing raw c3 json format with data.x config option
   * @method convertJsonToData
   * @override
   * @param {Array} json - array of json data, including 'x' key
   * @returns given json
   */
  c3infn.convertJsonToData = function(json) {
    // Always use `x` property as the x value
    this.config.data_x = 'x';

    // Support x categories being nested in the data
    this.config.axis_x_categories = json.map(function(row) {
      return row.x.displayValue;
    });

    return json;
  };

  /**
   * Allow giving x values in the data and using axis.x.categories config option
   * @method isCustomX
   * @override
   * @returns false
   */
  c3infn.isCustomX = function() {
    return false;
  };

  /**
   * @method getGaugeLabelHeight
   * @override
   * @returns {Number}
   */
  c3infn.getGaugeLabelHeight = function() {
    return 100;
  };

  /**
   * @method textForGaugeMinMax
   * @param {Number} min/max value
   * @returns {String} formatted value
   */
  c3infn.textForGaugeMinMax = function(value) {
    var format = this.config.gauge_minmaxformat;
    return format ? format(value) : value;
  };

  /**
   * Overrides the redrawArc method to add support for user define
   * min max value format
   *
   * @method redrawArc
   * @override
   * @param {Number} duration
   * @param {Number} durationForExit
   * @param {Object} withTransform
   * @returns {Void}
   */
  c3infn.redrawArc = function(duration, durationForExit, withTransform) {
    var $$ = this,
      d3 = $$.d3,
      config = $$.config,
      main = $$.main,
      mainArc;
    mainArc = main
      .selectAll('.' + $$.CLASS.arcs)
      .selectAll('.' + $$.CLASS.arc)
      .data($$.arcData.bind($$));
    mainArc
      .enter()
      .append('path')
      .attr('class', $$.classArc.bind($$))
      .style('fill', function(d) {
        return $$.color(d.data);
      })
      .style('cursor', function(d) {
        return config.interaction_enabled && config.data_selection_isselectable(d) ? 'pointer' : null;
      })
      .style('opacity', 0)
      .each(function(d) {
        if ($$.isGaugeType(d.data)) {
          d.startAngle = d.endAngle = -1 * (Math.PI / 2);
        }
        this._current = d;
      });
    mainArc
      .attr('transform', function(d) {
        return !$$.isGaugeType(d.data) && withTransform ? 'scale(0)' : '';
      })
      .style('opacity', function(d) {
        return d === this._current ? 0 : 1;
      })
      .on(
        'mouseover',
        config.interaction_enabled
          ? function(d) {
              var updated, arcData;
              if ($$.transiting) {
                // skip while transiting
                return;
              }
              updated = $$.updateAngle(d);
              arcData = $$.convertToArcData(updated);
              // transitions
              $$.expandArc(updated.data.id);
              $$.api.focus(updated.data.id);
              $$.toggleFocusLegend(updated.data.id, true);
              $$.config.data_onmouseover(arcData, this);
            }
          : null
      )
      .on(
        'mousemove',
        config.interaction_enabled
          ? function(d) {
              var updated = $$.updateAngle(d),
                arcData = $$.convertToArcData(updated),
                selectedData = [arcData];
              $$.showTooltip(selectedData, this);
            }
          : null
      )
      .on(
        'mouseout',
        config.interaction_enabled
          ? function(d) {
              var updated, arcData;
              if ($$.transiting) {
                // skip while transiting
                return;
              }
              updated = $$.updateAngle(d);
              arcData = $$.convertToArcData(updated);
              // transitions
              $$.unexpandArc(updated.data.id);
              $$.api.revert();
              $$.revertLegend();
              $$.hideTooltip();
              $$.config.data_onmouseout(arcData, this);
            }
          : null
      )
      .on(
        'click',
        config.interaction_enabled
          ? function(d, i) {
              var updated = $$.updateAngle(d),
                arcData = $$.convertToArcData(updated);
              if ($$.toggleShape) {
                $$.toggleShape(this, arcData, i);
              }
              $$.config.data_onclick.call($$.api, arcData, this);
            }
          : null
      )
      .each(function() {
        $$.transiting = true;
      })
      .transition()
      .duration(duration)
      .attrTween('d', function(d) {
        var updated = $$.updateAngle(d),
          interpolate;
        if (!updated) {
          return function() {
            return 'M 0 0';
          };
        }
        /*
         *                if (this._current === d) {
         *                    this._current = {
         *                        startAngle: Math.PI*2,
         *                        endAngle: Math.PI*2,
         *                    };
         *                }
         */
        if (isNaN(this._current.startAngle)) {
          this._current.startAngle = 0;
        }
        if (isNaN(this._current.endAngle)) {
          this._current.endAngle = this._current.startAngle;
        }
        interpolate = d3.interpolate(this._current, updated);
        this._current = interpolate(0);
        return function(t) {
          var interpolated = interpolate(t);
          interpolated.data = d.data; // data.id will be updated by interporator
          return $$.getArc(interpolated, true);
        };
      })
      .attr('transform', withTransform ? 'scale(1)' : '')
      .style('fill', function(d) {
        return $$.levelColor ? $$.levelColor(d.data.values[0].value) : $$.color(d.data.id);
      }) // Where gauge reading color would receive customization.
      .style('opacity', 1)
      .call($$.endall, function() {
        $$.transiting = false;
      });
    mainArc
      .exit()
      .transition()
      .duration(durationForExit)
      .style('opacity', 0)
      .remove();
    main
      .selectAll('.' + $$.CLASS.chartArc)
      .select('text')
      .style('opacity', 0)
      .attr('class', function(d) {
        return $$.isGaugeType(d.data) ? $$.CLASS.gaugeValue : '';
      })
      .text($$.textForArcLabel.bind($$))
      .attr('transform', $$.transformForArcLabel.bind($$))
      .style('font-size', function(d) {
        return $$.isGaugeType(d.data) ? Math.round($$.radius / 5) + 'px' : '';
      })
      .transition()
      .duration(duration)
      .style('opacity', function(d) {
        return $$.isTargetToShow(d.data.id) && $$.isArcType(d.data) ? 1 : 0;
      });
    main.select('.' + $$.CLASS.chartArcsTitle).style('opacity', $$.hasType('donut') || $$.hasType('gauge') ? 1 : 0);

    if ($$.hasType('gauge')) {
      $$.arcs.select('.' + $$.CLASS.chartArcsBackground).attr('d', function() {
        var d = {
          data: [{ value: config.gauge_max }],
          startAngle: -1 * (Math.PI / 2),
          endAngle: Math.PI / 2
        };
        return $$.getArc(d, true, true);
      });
      $$.arcs
        .select('.' + $$.CLASS.chartArcsGaugeUnit)
        .attr('dy', '.75em')
        .text(config.gauge_label_show ? config.gauge_units : '');
      /*
       * Custom logic to use user define min/max format if defined
       */
      $$.arcs
        .select('.' + $$.CLASS.chartArcsGaugeMin)
        .attr('dx', -1 * ($$.innerRadius + ($$.radius - $$.innerRadius) / 2) + 'px')
        .attr('dy', '1.2em')
        .text(config.gauge_label_show ? $$.textForGaugeMinMax(config.gauge_min) : '');
      $$.arcs
        .select('.' + $$.CLASS.chartArcsGaugeMax)
        .attr('dx', $$.innerRadius + ($$.radius - $$.innerRadius) / 2 + 'px')
        .attr('dy', '1.2em')
        .text(config.gauge_label_show ? $$.textForGaugeMinMax(config.gauge_max) : '');
    }
  };
}

export default {
  name: 'inject-c3-enhancements',
  initialize
};
