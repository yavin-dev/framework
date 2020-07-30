/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { configHost } from '../../utils/adapter';
import NaviMetadataAdapter, { MetadataOptions } from './interface';

export default class BardMetadataAdapter extends EmberObject implements NaviMetadataAdapter {
  /**
   * @property namespace - url namespace
   */
  namespace = 'v1';

  @service ajax!: TODO;

  /**
   * Builds a URL path for a metadata query
   *
   * @param type
   * @param id
   * @param options - optional host options.
   * @return URL Path
   */
  private buildURLPath(type: string, id: string, options: MetadataOptions): string {
    const host = configHost(options);
    const { namespace } = this;
    return `${host}/${namespace}/${camelize(pluralize(type))}/${id}`;
  }

  fetchEverything(options?: MetadataOptions): Promise<TODO> {
    return this.fetchAll('table', {
      query: { format: 'fullview' },
      ...options
    });
  }

  fetchAll(type: string, options?: MetadataOptions): Promise<TODO> {
    return this.fetchById(type, '', options);
  }

  fetchById(type: string, id: string, options: MetadataOptions = {}) {
    const url = this.buildURLPath(type, id, options);
    const { query = {}, clientId = 'UI', timeout = 300000 } = options;

    return this.ajax.request(url, {
      xhrFields: { withCredentials: true },
      beforeSend: (xhr: TODO) => xhr.setRequestHeader('clientid', clientId),
      crossDomain: true,
      data: query,
      timeout
    });
  }
}
