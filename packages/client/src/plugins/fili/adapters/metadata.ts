/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import NativeWithCreate, { Config } from '../../../models/native-with-create.js';
import fetch from 'cross-fetch';
import mapValues from 'lodash/mapValues.js';
import { FetchError } from '../../../errors/fetch-error.js';
import camelCase from 'lodash/camelCase.js';
import type NaviMetadataAdapter from '../../../adapters/metadata/interface.js';
import type { MetadataOptions } from '../../../adapters/metadata/interface.js';
import type { MetadataModelTypes } from '../../../services/metadata.js';
import type { ClientConfig } from '../../../config/datasources.js';
// Node 14 support
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only.js';

export default class BardMetadataAdapter extends NativeWithCreate implements NaviMetadataAdapter {
  /**
   * @property namespace - url namespace
   */
  private namespace = 'v1';

  @Config('client')
  declare clientConfig: ClientConfig;

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
    const host = this.clientConfig.configHost(options);
    const { namespace } = this;
    const bardType = this.getBardType(type);
    return `${host}/${namespace}/${camelCase(`${bardType}s`)}/${id}`;
  }

  /**
   * Performs xhr request
   * @param type - model type
   * @param id - model id
   * @param options - request options
   */
  private async query(type: MetadataModelTypes, id: string, options: MetadataOptions = {}) {
    const url = this.buildURLPath(type, id, options);
    const { query = {}, clientId = 'UI', timeout = 300000, customHeaders } = options;

    const urlRequest = `${url}?${new URLSearchParams(mapValues(query, (val) => `${val}`)).toString()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(urlRequest, {
      credentials: 'include',
      headers: {
        clientid: clientId,
        ...customHeaders,
      },
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      let payload: string;
      if (controller.signal.aborted) {
        payload = 'The fetch operation timed out';
      } else {
        payload = await response.text();
        try {
          payload = JSON.parse(payload);
        } catch {
          // nothing to do
        }
      }
      throw new FetchError(response.status, payload);
    }
    return await response.json();
  }

  async fetchEverything(options?: MetadataOptions) {
    const fullViewReq = this.query('table', '', { query: { format: 'fullview' }, ...options });
    const metricFunctionsReq = this.fetchAll('columnFunction', options);
    const [{ tables }, metricFunctions] = await Promise.all([fullViewReq, metricFunctionsReq]);
    return { tables, metricFunctions };
  }

  async fetchAll(type: MetadataModelTypes, options?: MetadataOptions) {
    const payload = await this.query(type, '', options).catch((e) => {
      if (e.status !== 404 && type === 'columnFunction') {
        throw e;
      }
      return {};
    });
    return payload.rows;
  }

  async fetchById(type: MetadataModelTypes, id: string, options: MetadataOptions = {}) {
    const payload = await this.query(type, id, options).catch((e) => {
      if (e.status !== 404) {
        throw e;
      }
      return undefined;
    });
    return payload ? [payload] : undefined;
  }
}
