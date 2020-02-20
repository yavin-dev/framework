/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviWidget
 *     @model={{widgetModel}}
 *     @taskInstasnce={{taskInstance}}
 *     @layoutOptions={{layoutObject}}
 *     @canEdit={{true}}
 *   />
 */
import { A as arr } from '@ember/array';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from '../templates/components/navi-widget';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class NaviWidget extends Component {
  /**
   * @property {String} visualizationPrefix - prefix for all visualizations types
   */
  visualizationPrefix = 'navi-visualizations/';

  /**
   * @property {Object} model - widget model
   */
  model = undefined;

  /**
   * @property {TaskInstance} taskInstasnce - data task instance
   */
  taskInstasnce = undefined;

  /**
   * @property {Object} layoutOptions - layout for dashboard presentation
   */
  layoutOptions = undefined;

  /**
   * @property {Object} options - object for grid-stack-item
   */
  @computed('layoutOptions.@each.{width,height,row,column,widgetId}', 'model.id')
  get options() {
    const {
      layoutOptions: layout,
      model: { id }
    } = this;

    if (layout) {
      // Map layout to gridstack options
      const { column: x, row: y, height, width } = layout;
      return { id, x, y, height, width };
    }

    return {};
  }

  /**
   * @property {Boolean} isRunning - whether widget data is loading
   */
  @computed('taskInstasnce.isRunning')
  get isRunning() {
    const { taskInstasnce } = this;

    return !taskInstasnce || taskInstasnce.isRunning;
  }

  /**
   * @property {String} filterErrors - Error messaging for filters that couldn't be applied to the widget
   */
  @computed('data')
  get filterErrors() {
    const filterErrors = get(this, 'result.firstObject.response.meta.errors') || [];
    const filterErrorMessages = filterErrors
      .filter(e => e.title === 'Invalid Filter')
      .map(e => e.detail)
      .join('\n');

    return filterErrorMessages ? `Unable to apply filter(s):\n${filterErrorMessages}` : null;
  }

  /**
   * @property {EmberArray|Null} data - widget data
   */
  @computed('taskInstasnce.{isSuccessful,value}')
  get data() {
    const { isSuccessful, value } = this.taskInstasnce || {};

    return isSuccessful && value ? arr(value) : null;
  }
}

export default NaviWidget;
