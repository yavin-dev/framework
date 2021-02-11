/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import ReportModel from 'navi-core/models/report';

interface Args {
  model: ReportModel;
}

export default class ReportActionSaveAs extends Component<Args> {
  @tracked
  showModal = false;

  @tracked
  private reportTitle = '';

  get reportName() {
    return isBlank(this.reportTitle) ? `(New Copy) ${this.args.model.title}`.substring(0, 150) : this.reportTitle;
  }

  @action
  toggleModal() {
    if (!this.isDestroyed && !this.isDestroying) {
      this.showModal = !this.showModal;
    }
  }
}
