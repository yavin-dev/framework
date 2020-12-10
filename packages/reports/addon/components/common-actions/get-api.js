/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <CommonActions::GetApi
 *      @request={{this.model.request}}
 *      @buttonClassNames="string of classes to apply to the button element"
 *      @beforeAction={{this.runThisFirst}}
 *   >
 *      Inner template
 *   </CommonActions::GetApi>
 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { set, action, computed } from '@ember/object';
import layout from '../../templates/components/common-actions/get-api';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

/**
 * Returns true if a string is a URL
 * @param string the string to check if it is a URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}

@templateLayout(layout)
@tagName('')
export default class GetApiActionComponent extends Component {
  /**
   * @property {Service} facts - instance of bard facts service
   */
  @service('navi-facts') facts;

  /**
   * @property {String} requestUrl - API link
   */
  @computed('request', 'showModal')
  get requestUrl() {
    // Observe 'showModal' to recompute each time the modal opens
    let request = this.request.serialize();
    return this.facts.getURL(request, { dataSourceName: request.dataSource });
  }
  /**
   * @property {Boolean} isUrl - is the requestURL string a URL
   */
  @computed('requestUrl')
  get isRequestURL() {
    return isValidUrl(this.requestUrl);
  }
  /**
   * Sets the notifications to false, used when modal is closed to clean it up.
   */
  @action
  resetNotifications() {
    set(this, 'successNotification', false);
    set(this, 'errorNotification', false);
  }
}
