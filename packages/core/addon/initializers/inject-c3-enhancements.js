/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { set } from '@ember/object';
import { A } from '@ember/array';
import c3 from 'c3';

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
   * C3 has a bug in which tweening happens even after chart is destroyed
   * Which causes the whole thing to crash
   * this overrides fixes that
   * https://github.com/c3js/c3/issues/2213
   * @override
   * @param { object } d data object
   * @param { Boolean } withoutUpdate  wheter svg should be updated
   * @param {String} forced return value
   * @return {String}
   */
  c3infn.getArc = function(d, withoutUpdate, force) {
    if (this.config === null) {
      return 'M 0 0';
    }
    return force || this.isArcType(d.data) ? this.svgArc(d, withoutUpdate) : 'M 0 0';
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
   * Overrides the defaults tooltipPosition to allow moving the tooltip to the left of the cursor
   * if it would go past the right side of the chart
   *
   * https://github.com/c3js/c3/blob/v0.7.9/src/tooltip.js#L175-L215
   * @method tooltipPosition
   * @override
   * @returns {Object} - the top and left offset positions for the tooltip
   *
   */
  c3infn.tooltipPosition = function(dataToShow, tWidth, tHeight, element) {
    const { config, d3 } = this;
    const forArc = this.hasArcType();
    const [mouseX, mouseY] = d3.mouse(element);
    let tooltipLeft, tooltipTop;

    if (forArc) {
      tooltipLeft = this.width / 2 + mouseX;
      tooltipTop = this.height / 2 + mouseY + 20;
    } else {
      const svgLeft = this.getSvgLeft(true);
      // position of verticalBar on chart
      const verticalBarX = svgLeft + this.getCurrentPaddingLeft(true) + this.x(dataToShow[0].x);

      let tooltipRight, chartRight;
      if (config.axis_rotated) {
        tooltipLeft = svgLeft + mouseX + 100;
        tooltipRight = tooltipLeft + tWidth;
        chartRight = this.currentWidth - this.getCurrentPaddingRight();
        tooltipTop = this.x(dataToShow[0].x) + 20;
      } else {
        tooltipLeft = verticalBarX + 20; // defaults to 20px after
        tooltipRight = tooltipLeft + tWidth;
        chartRight = svgLeft + this.currentWidth - this.getCurrentPaddingRight();
        tooltipTop = mouseY + 15;
      }

      // override here to move the tooltip an equal amount to the left of the vertical bar
      if (tooltipRight > chartRight) {
        tooltipLeft = verticalBarX - tWidth - 20;
      }
      if (tooltipTop + tHeight > this.currentHeight) {
        tooltipTop -= tHeight + 30;
      }
    }
    if (tooltipTop < 0) {
      tooltipTop = 0;
    }

    return { top: tooltipTop, left: tooltipLeft };
  };
}

export default {
  name: 'inject-c3-enhancements',
  initialize
};
