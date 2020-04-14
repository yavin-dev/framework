/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { A as arr } from '@ember/array';
import { run } from '@ember/runloop';
import { isPresent } from '@ember/utils';

type DirectoryParams = { type: string; filter: string };
export default class DirectoryMyDataRoute extends Route {
  /**
   * @property { Service } user
   */
  @service user: TODO;

  /**
   * @property {Object} _cache - local cache
   */
  _cache: Dict<TODO> = {};

  /**
   * @method _fetchFromUser
   * @private
   * @param {object} user
   * @param {string} entity - entity to fetch from user
   */
  async _fetchFromUser(user: TODO, entity: string) {
    //local cache
    const cache = this._cache;

    //fetch from cache if present
    if (cache[entity]) return cache[entity];

    //else fetch from user and set local cache
    const results = await user[entity];
    cache[entity] = results;
    set(this, '_cache', cache);
    return results;
  }

  /**
   * @method _fetchItems
   * @private
   * @param {object} user
   * @param {object} queryParams - all directory query params
   */
  async _fetchItems(user: TODO, { type, filter }: DirectoryParams) {
    const items = arr();

    if (type === null || type === 'reports') {
      const reports =
        filter === 'favorites'
          ? await this._fetchFromUser(user, 'favoriteReports')
          : await this._fetchFromUser(user, 'reports');

      if (isPresent(reports)) {
        run(() => items.push(...reports.toArray()));
      }
    }
    if (type === null || type === 'dashboards') {
      await run(async () => {
        const dashboards =
          filter === 'favorites'
            ? await this._fetchFromUser(user, 'favoriteDashboards')
            : await this._fetchFromUser(user, 'dashboards');

        if (isPresent(dashboards)) {
          items.push(...dashboards.toArray());
        }
      });
    }

    return items;
  }

  /**
   * @method model
   * @override
   */
  model() {
    const user = this.user.getUser();
    const directoryParams = this.paramsFor('directory') as DirectoryParams;

    //returning an object so that the table can handle the promise
    return {
      items: this._fetchItems(user, directoryParams)
    };
  }
}
