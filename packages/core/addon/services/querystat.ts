/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Store from 'ember-data/store';
import Service, { inject as service } from '@ember/service';
//@ts-ignore
import config from 'ember-get-config';

const NOT_FOUND = '404';

export default class QuerystatService extends Service {
  /**
   * @property {Ember.Service} store
   */
  @service() store!: Store;

  /**
   * Gets user model given user ID without triggering a fetch, if  user ID not specified gets logged-in user
   *
   * @method getQuerystat
   * @param {String} [userId] - user ID
   * @returns {DS.Model} - user model, if not found returns null
   */
  getQuerystat(requestId: string = config.navi.querystat): TODO {
    return this.store.peekRecord('querystat', requestId);
  }

  /**
   * Finds user given user ID, if user ID not specified gets logged-in user
   *
   * @method find
   * @param {String} [userId] - user ID
   * @returns {Promise} - Promise containing user model
   */
  findQuerystat(requestId = config.navi.querystat): TODO {
    return this.store.findRecord('querystat', requestId);
  }

  /**
   * Registers logged-in user
   *
   * @method register
   * @returns {Promise} - Promise containing logged-in user model
   */
  register(): Promise<TODO> {
    const userId = config.navi.querystat;
    const userModel = this.store.createRecord('querystat', { id: userId });

    return userModel.save();
  }

  /**
   * Finds logged-in user, if not present registers user
   *
   * @method findOrRegister
   * @returns {Promise} - Promise containing logged-in user model
   */
  findOrRegister(): Promise<TODO> {
    return this.findQuerystat().catch((serverError: any) => {
      if (serverError.errors?.[0]?.status === NOT_FOUND) {
        return this.register();
      }

      //reject promise
      throw serverError;
    });
  }
}
declare module '@ember/service' {
  interface Registry {
    querystat: QuerystatService;
  }
}
