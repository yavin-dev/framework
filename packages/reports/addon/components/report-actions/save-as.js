/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <ReportActions::SaveAs @model={{model}}>
 *      Inner template
 *   </ReportActions::SaveAs>
 */

import Component from '@ember/component';
import layout from '../../templates/components/report-actions/save-as';
import { action, set, computed } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class ReportActionSaveAs extends Component {
  /**
   * @property {Boolean} showModal - flag to control modal display
   */
  showModal = false;

  /**
   * @property {String} reportName - report name/title
   */
  @computed('model')
  get reportName() {
    return `(New Copy) ${this.model.title}`.substring(0, 150);
  }

  /**
   * @action closeModal or cancel modal.
   */
  @action
  closeModal() {
    // Avoid `calling set on destroyed object` error
    if (!this.isDestroyed && !this.isDestroying) {
      set(this, 'showModal', false);
    }
  }
}
