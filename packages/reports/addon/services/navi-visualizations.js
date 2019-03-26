/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization service meant to be a single place for
 * a parent app to get information about navi's visualizations package
 */

/* global requirejs */

import Service from '@ember/service';

import { getOwner } from '@ember/application';
import config from 'ember-get-config';

export default Service.extend({
  /**
   * @method defaultVisualization
   * @param request
   * @returns {String} visualization shown by default
   */
  defaultVisualization(/*request*/) {
    // TODO: add logic that decides the default visualization based on the request
    return 'table';
  },

  /**
   * @method validVisualizations
   * @param request
   * @returns {Array} visualizations that are valid for request
   */
  validVisualizations(request) {
    return this.all().filter(vis => vis.typeIsValid(request));
  },

  /**
   * @method getManifest
   * @param name
   * @returns {Object} visualization manifest object
   */
  getManifest(name) {
    return getOwner(this).lookup(`manifest:${name}`);
  },

  /**
   * @method all
   * @returns {Array} an array of available visualizations
   */
  all() {
    // Find all visualizations registered in requirejs under the namespace "components/navi-visualizations"
    let visualizationRegExp = new RegExp(`^(?:${config.modulePrefix}/)?manifests/([a-z-]*)$`),
      visualizationComponents = Object.keys(requirejs.entries).filter(key => visualizationRegExp.test(key)),
      visualizationArray = visualizationComponents.map(key => this.getManifest(visualizationRegExp.exec(key)[1]));

    // visualization must have a name
    return visualizationArray.filter(visualization => visualization.name);
  }
});
