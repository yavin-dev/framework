import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface Args {
  isVisible: boolean;
  runReport: () => void;
}

export default class ReportViewOverlay extends Component<Args> {
  @tracked wasDismissed = false;

  get shouldDisplay() {
    return this.wasDismissed === false && this.args.isVisible === true;
  }

  @action
  dismiss() {
    this.wasDismissed = true;
  }

  @action
  resetDismissed(_isVisible: Args['isVisible']) {
    this.wasDismissed = false;
  }
}
