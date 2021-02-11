/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Model from '@ember-data/model';

interface Args {
  model: Model;
  disabled: boolean;
  deleteAction: () => void;
}

export default class DeleteActionComponent extends Component<Args> {
  @tracked
  showModal = false;

  @tracked
  isDeleting = false;

  get modelName() {
    const { model } = this.args;
    //@ts-ignore
    return (model.constructor.modelName as string)?.replace(/-/g, ' ');
  }
}
