import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Roles extends Controller {
  /**
   * @property {Boolean} isAddUserModalOpen
   */
  @tracked isAddUserModalOpen = false;

  /**
   * @property {Number} userCount
   */
  get userCount(): number {
    return this.model.users.length;
  }

  /**
   * @method addUser – Add user to persistence layer
   */
  @action
  addUser() {
    this.isAddUserModalOpen = false;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    roles: Roles;
  }
}
