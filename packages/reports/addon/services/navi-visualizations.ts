/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization service meant to be a single place for
 * a parent app to get information about navi's visualizations package
 */

import Service from '@ember/service';
import { getOwner } from '@ember/application';
import config from 'ember-get-config';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';
import type NaviVisualizationBaseManifest from 'navi-core/navi-visualization-manifests/base';
import { VisualizationType } from 'navi-core/models/registry';

const global = window as typeof window & { requirejs: { entries: Record<string, unknown> } };

export default class NaviVisualizationsService extends Service {
  /**
   * @param request
   * @returns visualization shown by default
   */
  defaultVisualization(/*request*/): VisualizationType {
    // TODO: add logic that decides the default visualization based on the request
    return 'table';
  }

  /**
   * @param request
   * @returns visualizations that are valid for request
   */
  validVisualizations(request: RequestFragment) {
    return this.all().filter((vis) => vis.typeIsValid(request));
  }

  /**
   * @param name
   * @returns visualization manifest object
   */
  getManifest(name: string): NaviVisualizationBaseManifest {
    return getOwner(this).lookup(`navi-visualization-manifest:${name}`);
  }

  /**
   * @returns an array of available visualizations
   */
  all(): NaviVisualizationBaseManifest[] {
    // Find all visualization manifests registered in requirejs under the namespace "navi-visualization-manifests/*"
    const visualizationRegExp = new RegExp(`^(?:${config.modulePrefix}/)?navi-visualization-manifests/([a-z-]*)$`);
    const visualizationManifests = Object.keys(global.requirejs.entries).filter((key) => visualizationRegExp.test(key));
    const visualizationArray = visualizationManifests.map((key) => {
      const [, manifestName] = visualizationRegExp.exec(key) || [];
      return this.getManifest(manifestName);
    });

    // visualization must have a name
    return visualizationArray.filter((visualization) => visualization.name);
  }
}
