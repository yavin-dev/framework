/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization service meant to be a single place for
 * a parent app to get information about navi's visualizations package
 */

import Service from '@ember/service';
import config from 'ember-get-config';
import { assert } from '@ember/debug';
import { getOwner, setOwner } from '@ember/application';
import type RequestFragment from 'navi-core/models/request';
import { YavinVisualizationManifest } from 'navi-core/visualization/manifest';

const global = window as typeof window & { requirejs: { entries: Record<string, unknown> } };

export default class YavinVisualizationsService extends Service {
  private registry: Map<string, Map<string, YavinVisualizationManifest<unknown>>> = new Map();
  private defaultCategory = 'Standard';

  private owner = getOwner(this);

  constructor() {
    super(...arguments);
    this.defaultRegistration();
  }

  defaultRegistration() {
    // Find all visualization manifests registered in requirejs under the namespace "navi-visualization-manifests/*"
    const { owner } = this;
    const visualizationRegExp = new RegExp(`^(?:${config.modulePrefix}/)?navi-visualization-manifests/([a-z-]*)$`);
    const visualizationManifests = Object.keys(global.requirejs.entries).filter((key) => visualizationRegExp.test(key));
    visualizationManifests
      .map((key) => {
        const [, name] = visualizationRegExp.exec(key) || [];
        return owner.lookup(`navi-visualization-manifest:${name}`);
      })
      .forEach((m) => this.registerVisualization(m));
  }

  defaultVisualization(): YavinVisualizationManifest {
    const typeName = 'yavin:table';
    const visualization = this.getVisualization(typeName);
    assert('Cannot find configured default visualization: ${typeName}', visualization);
    return visualization;
  }

  validVisualizations(_request: RequestFragment) {
    //TODO long term want to show all, but might filter in short term
    return this.getVisualizations();
  }

  registerVisualization(visualization: YavinVisualizationManifest<unknown>, category = this.defaultCategory) {
    const { registry } = this;
    if (!registry.has(category)) {
      registry.set(category, new Map());
    }
    const categoryMap = registry.get(category);
    setOwner(visualization, this.owner);
    categoryMap?.set(visualization.typeName, visualization);
  }

  registerVisualizations(visualizations: YavinVisualizationManifest[], category = this.defaultCategory) {
    visualizations.forEach((v) => {
      this.registerVisualization(v, category);
    });
  }

  unregisterVisualization(name: string, category = this.defaultCategory): boolean {
    return this.registry.get(category)?.delete(name) ?? false;
  }

  getCategories(): string[] {
    return Object.keys(this.registry);
  }

  getVisualizations(categoryName = this.defaultCategory): YavinVisualizationManifest[] {
    const category = this.registry.get(categoryName);
    if (category) {
      return [...category.values()];
    }
    return [];
  }

  getVisualization(typeName: string): YavinVisualizationManifest {
    if (typeName === 'table') {
      typeName = 'yavin:table';
    }
    if (!typeName.includes(':')) {
      typeName = `$c3:${typeName}`;
    }
    const categories = [...this.registry.values()];
    const visualization = categories.flatMap((c) => [...c.values()]).find((m) => m.typeName === typeName);
    assert(`Visualization '${typeName}' cannot be found in the visualization registry`, visualization);
    return visualization;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'navi-visualizations': YavinVisualizationsService;
  }
}
