/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Store from '@ember-data/store';
import Service, { inject as service } from '@ember/service';
//@ts-ignore
import config from 'ember-get-config';

const NOT_FOUND = '404';

export default class UserService extends Service {
  /**
   * @property {Ember.Service} store
   */
  @service() store!: Store;

  /**
   * Gets user model given user ID without triggering a fetch, if  user ID not specified gets logged-in user
   *
   * @param userId - user ID
   * @returns user model, if not found returns null
   */
  getUser(userId: string = config.navi.user) {
    return this.store.peekRecord('user', userId);
  }

  /**
   * Finds user given user ID, if user ID not specified gets logged-in user
   *
   * @param userId - user ID
   * @returns Promise containing user model
   */
  findUser(userId = config.navi.user) {
    return this.store.findRecord('user', userId);
  }

  /**
   * Registers logged-in user
   *
   * @returns Promise containing logged-in user model
   */
  register() {
    const userId = config.navi.user;
    const userModel = this.store.createRecord('user', { id: userId });

    return userModel.save();
  }

  /**
   * Finds logged-in user, if not present registers user
   *
   * @returns Promise containing logged-in user model
   */
  findOrRegister() {
    return this.findUser().catch((serverError: any) => {
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
    user: UserService;
  }
}
