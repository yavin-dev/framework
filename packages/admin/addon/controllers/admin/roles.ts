import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class Roles extends Controller {
  /**
   * @property {Service} store
   */
  @service store: TODO;

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
  async addUser() {
    const userId = document.getElementById('navi-roles-dashboard__create-user-field')?.value;
    const email = document.getElementById('navi-roles-dashboard__create-email-field')?.value;
    const roles = document.getElementById('navi-roles-dashboard__create-roles-field')?.value;

    if (this.validateUserId && this.validateRoles) {
      const roleModels = await Promise.all(roles.split(' ').map((role: string) => this.store.findRecord('role', role)));
      const newUser = this.store.createRecord('user', {
        id: userId,
        roles: roleModels
      });
      await newUser.save();
    }

    this.isAddUserModalOpen = false;
  }

  /**
   * @method validateRoles – Validate if all roles exist in the store
   * @param {String} roles
   */
  validateRoles(roles: string): boolean {
    const rolesArray = roles.split(' ');
    for (const role of rolesArray) {
      if (this.store.peakRecord('role', role) === null) {
        return false;
      }
    }
    return true;
  }

  /**
   * @method validateUserId – Validate if user di already exist in the store
   * @param {String} roles
   */
  validateUserId(userId: string): boolean {
    if (this.store.peakRecord('user', userId) === null) {
      return true;
    }
    return false;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    roles: Roles;
  }
}
