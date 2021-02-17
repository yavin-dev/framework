/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import FlashMessageService from 'ember-cli-flash/services/flash-messages';
import type NaviNotificationService from 'navi-core/services/interfaces/navi-notifications';
import type { MessageOptions, MessageTimeout } from 'navi-core/services/interfaces/navi-notifications';

export default class NaviNotifications extends Service implements NaviNotificationService {
  @service
  flashMessages!: FlashMessageService;

  protected timeoutLengths: Partial<Record<MessageTimeout, number>> = {
    short: 3000,
    medium: 10000,
    long: 15000,
  };

  add(options: MessageOptions) {
    const { title, context, style = 'default', timeout = 'short' } = options;
    this.flashMessages.add({
      //@ts-ignore
      title,
      context,
      style,
      timeout: timeout != 'none' ? this.timeoutLengths[timeout] : undefined,
      sticky: timeout === 'none',
    });
  }

  clear() {
    this.flashMessages.clearMessages();
  }
}
