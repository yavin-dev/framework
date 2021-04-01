/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A model that holds the response from a Fact query.
 */

import EmberObject from '@ember/object';
import { taskFor } from 'ember-concurrency-ts';
import type NaviFactsService from 'navi-data/services/navi-facts';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';

export default class NaviFacts extends EmberObject {
  /**
   * the request object
   */
  declare request: RequestV2;

  /**
   * response for request
   */
  declare response: NaviFactResponse;

  /**
   * instance of the facts service passed in on create
   */
  declare _factService: NaviFactsService;

  /**
   * @returns Promise with the response model object for previous page or null when trying to access pages less than the first page
   */
  previous(): Promise<NaviFacts | null> {
    return taskFor(this._factService.fetchPrevious).perform(this.response, this.request);
  }

  /**
   * @returns Promise with the response model object for next page or null when trying to go past last page
   */
  next(): Promise<NaviFacts | null> {
    return taskFor(this._factService.fetchNext).perform(this.response, this.request);
  }
}
