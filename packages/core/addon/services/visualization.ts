/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization service meant to be a single place for
 * a parent app to get information about navi's visualizations package
 */

import Service from '@ember/service';
import type StoreService from '@ember-data/store';
import config from 'ember-get-config';
import { assert } from '@ember/debug';
import { getOwner, setOwner } from '@ember/application';
import { YavinVisualizationManifest } from 'navi-core/visualization/manifest';
import NaviVisualizationConfigWrapper from 'navi-core/components/navi-visualization-config/wrapper';
import NaviVisualizationWrapper from 'navi-core/components/navi-visualizations/wrapper';
import { sortBy } from 'lodash-es';
import type RequestFragment from 'navi-core/models/request';
import type NaviVisualizationBaseManifest from 'navi-core/navi-visualization-manifests/base';
import type { TypedVisualizationFragment } from 'navi-core/models/visualization';
import type { VisualizationType } from 'navi-core/models/registry';
import type NaviFactResponse from '@yavin/client/models/navi-fact-response';
import type YavinVisualizationModel from 'navi-core/models/visualization-v2';

const global = window as typeof window & { requirejs: { entries: Record<string, unknown> } };

class CompatManifest extends YavinVisualizationManifest {
  old: NaviVisualizationBaseManifest;

  currentVersion;
  namespace;
  type;
  niceName;
  icon;
  visualizationComponent = NaviVisualizationWrapper;
  settingsPanelComponent = NaviVisualizationConfigWrapper;

  get visualizationType(): VisualizationType {
    return this.type as VisualizationType;
  }

  constructor(legacy: NaviVisualizationBaseManifest) {
    super(...arguments);
    this.old = legacy;

    const owner = getOwner(this.old);
    const store = owner.lookup('service:store') as StoreService;

    this.namespace = ['metric-label', 'table'].includes(this.old.name) ? 'yavin' : 'c3';
    this.type = this.old.name;
    this.niceName = this.old.niceName;
    this.icon = this.old.icon;

    const viz = store.createFragment(this.visualizationType, {}) as TypedVisualizationFragment;
    this.currentVersion = viz.version;
    store.unloadRecord(viz);
  }

  validate(request: RequestFragment): { isValid: boolean; messages?: string[] } {
    const isValid = this.old.typeIsValid(request);
    return { isValid };
  }

  createNewSettings(): unknown {
    const temp = this.createModel();
    const settings = temp.metadata;
    this.store.unloadRecord(temp);
    return settings;
  }

  dataDidUpdate(currentSettings: object, request: RequestFragment, response: NaviFactResponse): object {
    const vizModel = this.store.createFragment(this.visualizationType, currentSettings);
    vizModel.metadata = currentSettings;
    let settings;
    if (!vizModel.isValidForRequest(request)) {
      vizModel.rebuildConfig(request, response);
      settings = vizModel.metadata;
    } else {
      settings = currentSettings;
    }
    this.store.unloadRecord(vizModel);
    return settings;
  }

  normalizeModel(settings: unknown): Promise<YavinVisualizationModel> {
    const { visualizationType } = this;
    const normalized = this.store.createFragment(visualizationType, { metadata: settings });
    return Promise.resolve(normalized);
  }

  createModel() {
    return this.store.createFragment(this.visualizationType, {});
  }
}

export default class YavinVisualizationsService extends Service {
  private registry: Map<string, Map<string, YavinVisualizationManifest<unknown>>> = new Map();
  private defaultCategory = 'Standard';
  private categoryOrder = [this.defaultCategory];

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
        return owner.lookup(`navi-visualization-manifest:${name}`) as NaviVisualizationBaseManifest;
      })
      .filter((m) => m.name) // filter out base class
      .forEach((m) => this.registerVisualization(new CompatManifest(m)));
  }

  defaultVisualization(): YavinVisualizationManifest {
    const typeName = 'yavin:table';
    const visualization = this.getVisualization(typeName);
    assert(`Cannot find configured default visualization: ${typeName}`, visualization);
    return visualization;
  }

  validVisualizations(request: RequestFragment) {
    return this.getAllVisualizations().filter((m) => m.validate(request).isValid === true);
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
    const categories = [...this.registry.keys()];
    const categoryOrdering = Object.fromEntries(this.categoryOrder.map((g, i) => [g, i]));
    return sortBy(categories, (category) => categoryOrdering[category]);
  }

  setCategoryOrder(categoryOrder: string[]): void {
    this.categoryOrder = categoryOrder;
  }

  getAllVisualizations(): YavinVisualizationManifest[] {
    return this.getCategories().flatMap((category) => this.getVisualizations(category));
  }

  getVisualizations(categoryName = this.defaultCategory): YavinVisualizationManifest[] {
    const category = this.registry.get(categoryName);
    if (category) {
      return [...category.values()];
    }
    return [];
  }

  getVisualization(typeName: string): YavinVisualizationManifest {
    const categories = [...this.registry.values()];
    const visualization = categories.flatMap((c) => [...c.values()]).find((m) => m.typeName === typeName);
    assert(`Visualization '${typeName}' cannot be found in the visualization registry`, visualization);
    return visualization;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    visualization: YavinVisualizationsService;
  }
}
