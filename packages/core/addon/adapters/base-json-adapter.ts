/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { camelize } from '@ember/string';
import DS from 'ember-data';
import config from 'ember-get-config';
import { pluralize } from 'ember-inflector';
import ModelRegistry from 'ember-data/types/registries/model';
import Store from 'ember-data/store';
import RSVP from 'rsvp';

type ErrorResponse = {
  status: string;
  title: string;
  detail: string;
};

export default abstract class BaseJsonAdapter extends DS.JSONAPIAdapter {
  //@ts-ignore
  get host() {
    return config.navi.appPersistence.uri || '';
  }

  coalesceFindRequests = true;

  ajaxOptions(url: string, type: string, options?: { data?: unknown; contentType?: string }): object {
    const hash = super.ajaxOptions(url, type, options) as Record<string, unknown>;
    hash.xhrFields = {
      withCredentials: true
    };
    hash.crossDomain = true;

    //only set contentType if content is present
    hash.contentType = options?.data ? 'application/vnd.api+json' : undefined;

    hash.headers = {
      Accept: 'application/vnd.api+json',
      ...(hash.contentType ? { 'Content-Type': hash.contentType } : {})
    };

    return hash;
  }

  shouldBackgroundReloadRecord() {
    return false;
  }

  findMany<K extends keyof ModelRegistry>(
    _store: Store,
    type: ModelRegistry[K],
    ids: (number | string)[],
    snapshots: unknown[]
  ): RSVP.Promise<unknown> {
    // Match our API's format for filters since it differs from Ember Data default
    const { modelName } = (type as unknown) as typeof DS.Model;
    const url = this.buildURL(`${modelName}`, ids, snapshots, 'findMany');
    const filterRoot = pluralize(`${modelName}`);
    const filterId = `${filterRoot}.id`;

    return this.ajax(url, 'GET', {
      data: { filter: { [filterId]: ids.join(',') } }
    });
  }

  /**
   * @method normalizeErrorResponse
   * @override
   * @private
   * @param  {Number} status - status code
   * @param  {Object} headers - response headers
   * @param  {Object} payload - response payload
   * @return {Object} errors payload
   *
   */
  normalizeErrorResponse(
    status: number,
    _headers: Record<string, string>,
    payload: { errors: string }
  ): ErrorResponse[] {
    const detail = payload.errors;
    return [
      {
        status: `${status}`,
        title: 'The backend responded with an error',
        detail
      }
    ];
  }

  pathForType<K extends keyof ModelRegistry>(type: K): string {
    return pluralize(camelize(`${type}`));
  }
}
