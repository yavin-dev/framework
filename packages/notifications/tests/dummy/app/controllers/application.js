import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class extends Controller {
  @service
  naviNotifications;

  @action
  addSuccess() {
    const type = 'success';
    this.naviNotifications.add({
      message: `${type} message`,
      type
    });
  }

  @action
  addWarning() {
    const type = 'warning';
    this.naviNotifications.add({
      message: `${type} message`,
      type
    });
  }

  @action
  addInfo() {
    const type = 'info';
    this.naviNotifications.add({
      message: `${type} message`,
      type
    });
  }

  @action
  addDanger() {
    const type = 'danger';
    this.naviNotifications.add({
      message: `${type} message`,
      type
    });
  }

  @action
  clear() {
    this.naviNotifications.clearMessages();
  }
}
