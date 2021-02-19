/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import type { MessageOptions, MessageStyle } from 'navi-core/services/interfaces/navi-notifications';

interface Flash extends MessageOptions {
  destroyMessage: () => void;
}

interface NaviNotificationsAlertArgs {
  flash: Flash;
}

export default class NaviNotificationsAlert extends Component<NaviNotificationsAlertArgs> {
  protected iconMap: Partial<Record<MessageStyle, string>> = {
    info: 'information-circle',
    warning: 'warning',
    success: 'check-circle',
    danger: 'stop-warning',
  };

  get icon(): string | undefined {
    const { style } = this.args.flash;
    return style ? this.iconMap[style] : undefined;
  }

  @action
  onClose(): void | undefined {
    this.args.flash?.destroyMessage();
  }
}
