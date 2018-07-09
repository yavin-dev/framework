/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { get } from '@ember/object';
import { A as arr } from '@ember/array';
import { run } from '@ember/runloop';

export default Route.extend({
  /**
   * @property { Service } user
   */
  user: inject(),

  async _fetchItems(user, { type, sortBy }){
    let reports,
        dashboards,
        items = arr();

    if(type === null || type === 'reports'){
      reports = await get(user, 'reports');
      run(() => items.push(...reports.toArray()));
    }
    if(type === null || type === 'dashboards'){
      await run(async () => {
        dashboards = await get(user, 'dashboards');
        items.push(...dashboards.toArray())
      });
    }

    return items.sortBy(sortBy);
  },

  model() {
    let user = get(this, 'user').getUser(),
        directoryParams = this.paramsFor('directory');

    return this._fetchItems(user, directoryParams);
  }
});
