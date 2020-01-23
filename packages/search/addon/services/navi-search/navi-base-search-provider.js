import Service, { inject as service } from '@ember/service';

export default class NaviBaseSearchProviderService extends Service {
  /**
   * @property {Ember.Service} store
   */
  @service store;

  /**
   * @property name
   */
  name = undefined;

  /**
   * @property niceName
   */
  niceName = undefined;

  /**
   * @property associatedComponent
   */
  associatedComponent = undefined;

  /**
   * @method search
   */
  search() {}
}
