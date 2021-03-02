/**
 * Copyright 2021 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import NaviNotificationsService from 'navi-core/addon/services/interfaces/navi-notifications';

interface Args {
  buildUrl?: () => string;
}
export default class ShareActionComponent extends Component<Args> {
  @service
  naviNotifications!: NaviNotificationsService;

  get shareUrl() {
    // Allow custom url logic for sharing something other than current page
    const { buildUrl } = this.args;
    return buildUrl ? buildUrl() : document.location.href;
  }

  @action
  onSuccess() {
    this.naviNotifications.add({
      title: 'Link copied',
      style: 'info',
      timeout: 'short',
      extra: this.shareUrl,
    });
  }
}
