/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <ReportView
 *    @report={{this.report}}
 *    @response={{this.response}}
 *    @isFiltersCollapsed={{this.isFiltersCollapsed}}
 *  />
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { scheduleOnce } from '@ember/runloop';
//@ts-ignore
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';
//@ts-ignore
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';
import type ReportModel from 'navi-core/models/report';
import type NaviFactResponse from '@yavin/client/models/navi-fact-response';
import type StoreService from '@ember-data/store';
import type TransitionContext from 'ember-animated/-private/transition-context';
import type { YavinVisualizationManifest } from 'navi-core/visualization/manifest';
import type YavinVisualizationsService from 'navi-core/services/visualization';

const VISUALIZATION_RESIZE_EVENT = 'resizestop';

interface ReportViewArgs {
  report: ReportModel;
  response: NaviFactResponse;

  /**
   * Property representing any data useful for providing additional functionality to a visualization and request
   * Acts a hook to be extended by other navi addons
   * @property {Promise} annotationData
   */
  annotationData: Promise<unknown>;
  hasRequestRun: boolean;
  isFiltersCollapsed: boolean;
}

export default class ReportView extends Component<ReportViewArgs> {
  @service
  declare visualization: YavinVisualizationsService;

  @service
  declare store: StoreService;

  /**
   * Display visualization config or not
   */
  @tracked isEditingVisualization = false;

  @tracked componentElement!: HTMLElement;

  guid = guidFor(this);

  get request() {
    return this.args.report.request;
  }

  /**
   * array of available visualizations
   * annotated with a field corresponding to whether the visualization type is valid based on the request
   */
  get validVisualizations() {
    return this.visualization.validVisualizations(this.args.report.request);
  }

  /**
   * Display name of the visualization type
   */
  get visualizationTypeLabel() {
    return this.args.report.visualization.manifest.niceName;
  }

  /**
   * the visualization type of the report
   */
  get currentView() {
    return this.args.report.visualization.type;
  }

  /**
   * whether or not there is data to display
   */
  get hasNoData() {
    return this.args.response?.rows?.length === 0;
  }

  @action
  getContainer() {
    return document.getElementById(this.guid);
  }

  @action
  setupElement(el: HTMLElement) {
    this.componentElement = el;
  }

  @action
  filtersUpdate(_el: HTMLElement, [_isFiltersCollapsed, _numFilters]: [ReportViewArgs['isFiltersCollapsed'], number]) {
    this.resizeVisualization();
  }

  /**
   * @method doResizeVisualization
   */
  doResizeVisualization() {
    this.componentElement.dispatchEvent(new Event(VISUALIZATION_RESIZE_EVENT));
  }

  /**
   * @action toggleEditVisualization
   */
  @action
  toggleEditVisualization() {
    this.isEditingVisualization = !this.isEditingVisualization;
  }

  /**
   * @action resizeVisualization
   */
  @action
  resizeVisualization() {
    scheduleOnce('afterRender', this, 'doResizeVisualization');
  }

  /**
   * @action onVisualizationTypeUpdate
   * @param {String} type
   */
  @action
  async onVisualizationTypeUpdate(manifest: YavinVisualizationManifest) {
    const {
      report,
      report: { request },
      response,
    } = this.args;

    const newVisualization = manifest.createModel();
    const newSettings = manifest.dataDidUpdate(newVisualization.metadata, request, response);
    newVisualization.metadata = newSettings;
    report.updateVisualization(newVisualization);
  }

  /**
   * Custom fade transition when editing a visualization
   * @param context - animation context
   */
  @action
  *visFadeTransition({ removedSprites, insertedSprites }: TransitionContext) {
    yield Promise.all(insertedSprites.map(fadeIn));
    yield Promise.all(removedSprites.map(fadeOut));
  }

  /**
   * Drawer transition
   * @param context - animation context
   */
  @action
  *drawerTransition({ insertedSprites, removedSprites }: TransitionContext) {
    const x = document.querySelector('.report-view__animation-container')?.getBoundingClientRect().right;
    yield Promise.all(
      insertedSprites.map((sprite) => {
        sprite.startAtPixel({ x });
        sprite.applyStyles({ 'z-index': '1' });
        return move(sprite, { easing: easeOut });
      })
    );

    yield Promise.all(
      removedSprites.map((sprite) => {
        sprite.applyStyles({ 'z-index': '1' });
        sprite.endAtPixel({ x });
        return move(sprite, { easing: easeIn });
      })
    );
    this.resizeVisualization();
  }
}
