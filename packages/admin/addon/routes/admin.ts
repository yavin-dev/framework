import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class Admin extends Route {
  /**
   * @property { Service } user
   */
  @service user: TODO;

  /**
   * @method model
   * @override
   */
  model() {
    return this.user.getUser();
  }
}
