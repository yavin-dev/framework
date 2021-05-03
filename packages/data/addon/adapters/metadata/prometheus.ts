/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import NaviMetadataAdapter, { MetadataOptions } from './interface';
import { configHost } from 'navi-data/utils/adapter';
import { hash } from 'rsvp';
import type { AjaxServiceClass } from 'ember-ajax/services/ajax';

export default class PrometheusMetadataAdapter extends EmberObject implements NaviMetadataAdapter {
  @service
  private declare ajax: AjaxServiceClass;

  async fetchEverything(options: MetadataOptions): Promise<TODO> {
    const host = configHost(options);
    const metrics = this.ajax.request(`${host}/api/v1/metadata`, {
      timeout: 1000,
    });
    const dimensions = this.ajax.request(`${host}/api/v1/labels`, {
      timeout: 1000,
    });
    return hash({
      tables: ['default'],
      metrics,
      dimensions,
    });
  }

  async fetchAll(_type: string, _options?: MetadataOptions) {
    return {};
  }

  async fetchById(_type: string, _id: string, _options: MetadataOptions = {}) {
    return {};
  }
}
