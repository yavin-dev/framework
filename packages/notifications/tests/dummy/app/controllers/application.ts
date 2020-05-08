import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class extends Controller {
  @service
  naviNotifications!: TODO;

  @action
  addSuccess(): void {
    const type = 'success';
    this.naviNotifications.add({
      message: `${type} message`,
      type
    });
  }

  @action
  addWarning(): void {
    const type = 'warning';
    this.naviNotifications.add({
      message: `${type} message`,
      type
    });
  }

  @action
  addInfo(): void {
    const type = 'info';
    this.naviNotifications.add({
      message: `${type} message`,
      type
    });
  }

  @action
  addDanger(): void {
    const type = 'danger';
    this.naviNotifications.add({
      message: `${type} message`,
      type
    });
  }

  @action
  clear(): void {
    this.naviNotifications.clearMessages();
  }
}
