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

@templateLayout(layout)
@tagName('')
class GetApiActionComponent extends Component {
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
   * Sets the notifications to false, used when modal is closed to clean it up.
   */
  @action
  resetNotifications() {
    set(this, 'successNotification', false);
    set(this, 'errorNotification', false);
  }
}

export default GetApiActionComponent;
