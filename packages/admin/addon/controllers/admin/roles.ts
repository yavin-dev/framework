import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

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
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    roles: Roles;
  }
}
