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
import { MetadataModelTypes } from 'navi-data/services/navi-metadata';

export default class BardMetadataAdapter extends EmberObject implements NaviMetadataAdapter {
  /**
   * @property namespace - url namespace
   */
  private namespace = 'v1';

  @service
  private ajax!: TODO;

  private typeTransform: Record<string, string> = {
    columnFunction: 'metricFunction',
  };

  /**
   * Returns bard type for metadata type
   * @param type - model type
   */
  private getBardType(type: MetadataModelTypes): string {
    return this.typeTransform[type] || type;
  }

  /**
   * Builds a URL path for a metadata query
   *
   * @param type - model type
   * @param id - model id
   * @param options - optional host options.
   * @return URL Path
   */
  private buildURLPath(type: MetadataModelTypes, id: string, options: MetadataOptions): string {
    const host = configHost(options);
    const { namespace } = this;
    const bardType = this.getBardType(type);
    return `${host}/${namespace}/${camelize(pluralize(bardType))}/${id}`;
  }

  /**
   * Performs xhr request
   * @param type - model type
   * @param id - model id
   * @param options - request options
   */
  private async query(type: MetadataModelTypes, id: string, options: MetadataOptions = {}): Promise<TODO> {
    const url = this.buildURLPath(type, id, options);
    const { query = {}, clientId = 'UI', timeout = 300000 } = options;

    return this.ajax.request(url, {
      xhrFields: { withCredentials: true },
      beforeSend: (xhr: TODO) => xhr.setRequestHeader('clientid', clientId),
      crossDomain: true,
      data: query,
      timeout,
    });
  }

  async fetchEverything(options?: MetadataOptions): Promise<TODO> {
    const fullViewReq = this.query('table', '', { query: { format: 'fullview' }, ...options });
    const metricFunctionsReq = this.fetchAll('columnFunction');
    const [{ tables }, metricFunctions] = await Promise.all([fullViewReq, metricFunctionsReq]);
    return { tables, metricFunctions };
  }

  async fetchAll(type: MetadataModelTypes, options?: MetadataOptions): Promise<TODO[]> {
    const payload = await this.query(type, '', options).catch((e) => {
      if (e.status !== 404 && type === 'columnFunction') {
        throw e;
      }
      return {};
    });
    return payload.rows;
  }

  async fetchById(type: MetadataModelTypes, id: string, options: MetadataOptions = {}): Promise<TODO[] | undefined> {
    const payload = await this.query(type, id, options).catch((e) => {
      if (e.status !== 404) {
        throw e;
      }
      return undefined;
    });
    return payload ? [payload] : undefined;
  }
}
