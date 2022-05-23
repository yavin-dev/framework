/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A model that holds the response from a Fact query.
 */
import NativeWithCreate, { ClientService, Injector } from 'navi-data/models/native-with-create';
import { taskFor } from 'ember-concurrency-ts';
import type NaviFactsService from 'navi-data/services/navi-facts';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';

interface NaviFactsPayload {
  request: RequestV2;
  response: NaviFactResponse;
}

export default class NaviFacts extends NativeWithCreate {
  constructor(injector: Injector, args: NaviFactsPayload) {
    super(injector, args);
  }

  @ClientService('navi-facts')
  protected declare factService: NaviFactsService;

  declare request: RequestV2;

  declare response: NaviFactResponse;

  /**
   * @returns Promise with the response model object for previous page or null when trying to access pages less than the first page
   */
  previous(): Promise<NaviFacts | null> {
    return taskFor(this.factService.fetchPrevious).perform(this.response, this.request);
  }

  /**
   * @returns Promise with the response model object for next page or null when trying to go past last page
   */
  next(): Promise<NaviFacts | null> {
    return taskFor(this.factService.fetchNext).perform(this.response, this.request);
  }
}
