/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { get, set } from '@ember/object';
import { A as arr } from '@ember/array';
import { run } from '@ember/runloop';

export default Route.extend({
  /**
   * @property { Service } user
   */
  user: inject(),

  /**
   * @property {Object} _cache - local cache
   */
  _cache: undefined,

  /**
   * @method _fetchFromUser
   * @private
   * @param {Object} user
   * @param {String} entity - entity to fetch from user
   */
  async _fetchFromUser(user, entity) {
    //local cache
    let cache = get(this, '_cache') || {};

    //fetch from cache if present
    if(cache[entity])
      return cache[entity];

    //else fetch from user and set local cache
    let results = await get(user, entity);
    cache[entity] = results;
    set(this, '_cache', cache);
    return results;
  },

  /**
   * @method _fetchItems
   * @private
   * @param {Object} user
   * @param {Object} queryParams - all directory query params
   */
  async _fetchItems(user, { type, filter }){
    let reports,
        dashboards,
        items = arr();

    if(type === null || type === 'reports'){
      reports = filter === 'favorites' ?
        await this._fetchFromUser(user, 'favoriteReports') :
        await this._fetchFromUser(user, 'reports');

      run(() => items.push(...reports.toArray()));
    }
    if(type === null || type === 'dashboards'){
      await run(async () => {
        dashboards = filter === 'favorites' ?
          await this._fetchFromUser(user, 'favoriteDashboards') :
          await this._fetchFromUser(user, 'dashboards');

        items.push(...dashboards.toArray())
      });
    }

    return items;
  },

  /**
   * @method model
   * @override
   */
  model() {
    let user = get(this, 'user').getUser(),
        directoryParams = this.paramsFor('directory');

    //returning an object so that the table can handle the promise
    return {
      items: this._fetchItems(user, directoryParams)
    };
  }
});
