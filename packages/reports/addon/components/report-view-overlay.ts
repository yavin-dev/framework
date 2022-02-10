/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface Args {
  isVisible: boolean;
  runReport: () => void;
}

export default class ReportViewOverlay extends Component<Args> {
  @tracked wasDismissed = false;
  wasVisible?: boolean;

  get shouldDisplay() {
    return this.wasDismissed === false && this.args.isVisible === true;
  }

  @action
  dismiss() {
    this.wasDismissed = true;
  }

  @action
  setupElement() {
    this.wasVisible = this.args.isVisible;
  }

  @action
  resetDismissed(_el: HTMLElement, [isVisible]: [Args['isVisible']]) {
    if (this.wasVisible === false && isVisible === true) {
      this.wasDismissed = false;
    }
    this.wasVisible = isVisible;
  }
}
