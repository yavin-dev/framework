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
import { action, set } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { isBlank } from '@ember/utils';

@templateLayout(layout)
@tagName('')
export default class ReportActionSaveAs extends Component {
  /**
   * @property {Boolean} showModal - flag to control modal display
   */
  showModal = false;

  /**
   * @private
   * @property {string} state holder for overriding default reportName
   */
  _reportTitle = '';

  /**
   * @property {String} reportName - report name/title
   */
  get reportName() {
    return isBlank(this._reportTitle) ? `(New Copy) ${this.model.title}`.substring(0, 150) : this._reportTitle;
  }

  set reportName(value) {
    this._reportTitle = value;
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
