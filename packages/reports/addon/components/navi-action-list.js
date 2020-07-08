/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviActionList
 *      @item={{this.report}}
 *      @index={{this.index}}
 *   />
 */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import layout from '../templates/components/navi-action-list';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class NaviActionList extends Component {
  /**
   * @property {Service} router
   */
  @service router;

  /**
   * @action buildUrl
   * @param {DS.Model} item - report or dashboard model with id
   * @returns {String} url for given model
   */
  @action
  buildUrl(model) {
    const { id } = model;
    const modelType = model.constructor.modelName;
    const baseUrl = document.location.origin;
    const modelUrl = this.router.urlFor(`${modelType}s.${modelType}`, id);

    return baseUrl + modelUrl;
  }
}
