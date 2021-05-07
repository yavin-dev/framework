/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import config from 'navi-app/config/environment';
export default class ApplicationRoute extends Route {
  @service naviMetadata;

  @service user;

  async model() {
    //kick off datasource loading
    config.navi.dataSources.forEach(({ name: dataSourceName }) => this.naviMetadata.loadMetadata({ dataSourceName }));
    await this.user.findOrRegister();
  }
}
