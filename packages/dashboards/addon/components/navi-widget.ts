/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviWidget
 *     @model={{widgetModel}}
 *     @taskInstance={{taskInstance}}
 *     @layoutOptions={{layoutObject}}
 *     @canEdit={{true}}
 *     @isLastAdded={{true}}
 *     @index={{index}}
 *   />
 */
import Component from '@glimmer/component';
import { A as arr } from '@ember/array';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import type EmberArray from '@ember/array';
import type DashboardWidget from 'navi-core/models/dashboard-widget';
import type LayoutFragment from 'navi-core/models/fragments/layout';
import type {
  FilterError,
  NaviFactsWithRequestFragment,
  WidgetData,
  WidgetDataTask,
} from 'navi-dashboards/services/dashboard-data';

interface NaviWidgetArgs {
  model: DashboardWidget;
  layoutOptions: LayoutFragment;
  taskInstance: WidgetDataTask;
  canEdit: boolean;
  isLastAdded?: boolean;
  index?: number;
}

export default class NaviWidget extends Component<NaviWidgetArgs> {
  /**
   * @property {String} visualizationPrefix - prefix for all visualizations types
   */
  visualizationPrefix = 'navi-visualizations/';

  /**
   * @property {Object} options - object for grid-stack-item
   */
  get options() {
    const {
      layoutOptions: layout,
      model: { id },
    } = this.args;

    if (layout) {
      // Map layout to gridstack options
      const { column: x, row: y, height, width } = layout;
      return { id, x, y, height, width };
    }

    return {};
  }

  /**
   * @property {Boolean} isLoading - whether widget data is loading
   */
  get isLoading() {
    const { taskInstance } = this.args;

    return !taskInstance || taskInstance.isRunning;
  }

  /**
   * @property {String} filterErrors - Error messaging for filters that couldn't be applied to the widget
   */
  get filterErrors() {
    //@ts-ignore
    const filterErrors = this.data?.firstObject?.response?.meta?.errors ?? [];
    const filterErrorMessages = (filterErrors as FilterError[])
      .filter((e) => e.title === 'Invalid Filter')
      .map((e) => e.detail)
      .join('\n');

    return filterErrorMessages ? `Unable to apply filter(s):\n${filterErrorMessages}` : null;
  }

  /**
   * @property {EmberArray|Null} data - widget data
   */
  get data(): EmberArray<NaviFactsWithRequestFragment> | null {
    const { isSuccessful, value } = this.args.taskInstance || {};
    return isSuccessful ? arr(value as WidgetData) : null;
  }

  @action
  scrollContainerToBottom(element: HTMLElement) {
    const containerElement = element.closest('.navi-dashboard__widgets');
    assert('Widgets container element should exist', containerElement);
    containerElement.scrollTop = containerElement.scrollHeight;
  }
}
