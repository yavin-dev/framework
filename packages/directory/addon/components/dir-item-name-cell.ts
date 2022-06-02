/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This component won't be used directly. It is passed to ember-light-table as a custom cell component.
 * Ember-light-table will pass any parameters in through the value attribute.
 *
 * <DirItemNameCell
 *  @value={{@item}}
 * />
 */
import Component from '@glimmer/component';
import { pluralize } from 'ember-inflector';
import type ReportModel from 'navi-core/models/report';
import type DashboardModel from 'navi-core/models/dashboard';

interface DirItemNameCellComponentArgs {
  value: ReportModel | DashboardModel;
}

export default class DirItemNameCellComponent extends Component<DirItemNameCellComponentArgs> {
  /**
   * @property {String} itemLink - the route that this component should link to (without the id)
   */
  get itemLink() {
    const { type } = this;
    return `${pluralize(type)}.${type}`;
  }

  /**
   * @property {String} itemId - the id of the model or the tempId of an unsaved model
   */
  get itemId() {
    return this.args.value?.modelId;
  }

  /**
   * @property {String} type - the type of the item
   */
  get type() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore (ember data generates this field)
    return this.args.value?.constructor?.modelName;
  }
}
