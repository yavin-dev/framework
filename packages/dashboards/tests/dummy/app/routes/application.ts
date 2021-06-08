import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import UserModel from 'navi-core/models/user';
import UserService from 'navi-core/services/user';

export default class ApplicationRoute extends Route {
  @service
  private declare user: UserService;

  model(): Promise<UserModel> {
    return this.user.findOrRegister();
  }
}
