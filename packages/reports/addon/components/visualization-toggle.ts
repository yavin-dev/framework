/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <VisualizationToggle
 *    @report={{this.report}}
 *    @validVisualizations={{this.validVisualizations}}
 *    @onVisualizationTypeUpdate={{this.onVisualizationTypeUpdate}}
 *  />
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import type ReportModel from 'navi-core/models/report';
import type { YavinVisualizationManifest } from 'navi-core/visualization/manifest';
import type YavinVisualizationsService from 'navi-core/services/visualization';

interface Args {
  report: ReportModel;
  validVisualizations: YavinVisualizationManifest[];
  onVisualizationTypeUpdate: (name: YavinVisualizationManifest) => void;
}

export default class VisualizationToggle extends Component<Args> {
  @service declare visualization: YavinVisualizationsService;

  @tracked selectedCategory;

  constructor(owner: unknown, args: Args) {
    super(owner, args);
    this.selectedCategory = this.getCurrentCategory();
  }

  @action
  selectCategory(category: string) {
    this.selectedCategory = category;
    const visualizations = this.valid.categoryToVisualizations[this.selectedCategory];
    this.args.onVisualizationTypeUpdate(visualizations[visualizations.length - 1]);
  }

  @action
  updateCategory() {
    this.selectedCategory = this.getCurrentCategory();
  }

  @action
  getCurrentCategory() {
    const { manifest } = this.args.report.visualization;
    const [category] =
      Object.entries(this.valid.categoryToVisualizations).find(([_category, validVisualizations]) =>
        validVisualizations.includes(manifest)
      ) ?? [];
    return category ?? this.valid.categories[0];
  }

  get selectedVisualization() {
    return this.args.report.visualization.manifest;
  }

  get valid() {
    const categories: string[] = [];
    const categoryToVisualizations: Record<string, YavinVisualizationManifest[]> = {};
    this.visualization.getCategories().forEach((category) => {
      const validVisualizations = this.visualization
        .getVisualizations(category)
        .filter((v) => this.args.validVisualizations.includes(v));
      if (validVisualizations.length > 0) {
        categories.push(category);
        categoryToVisualizations[category] = validVisualizations;
      }
    });
    return { categories, categoryToVisualizations };
  }
}
