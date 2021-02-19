import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type NaviNotificationService from 'navi-core/services/interfaces/navi-notifications';
import type { MessageTimeout, MessageStyle } from 'navi-core/services/interfaces/navi-notifications';
import { tracked } from '@glimmer/tracking';

export default class extends Controller {
  @service
  naviNotifications!: NaviNotificationService;

  timeoutOptions: MessageTimeout[] = ['short', 'medium', 'long', 'none'];

  styleOptions: MessageStyle[] = ['default', 'info', 'warning', 'success', 'danger'];

  @tracked
  timeout: MessageTimeout = this.timeoutOptions[0];

  @action
  add(style: MessageStyle): void {
    this.naviNotifications.add({
      title: `${style} title`,
      context: `${style} context`,
      timeout: this.timeout,
      style,
    });
  }

  @action
  clear(): void {
    this.naviNotifications.clear();
  }
}
