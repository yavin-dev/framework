/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A model that holds the response from a Fact query.
 */
import NativeWithCreate, { ClientService, Injector } from './native-with-create.js';
import type { RequestV2 } from '../request.js';
import type NaviFactResponse from './navi-fact-response.js';
import type FactService from '../services/interfaces/fact.js';

interface NaviFactsPayload {
  request: RequestV2;
  response: NaviFactResponse;
}

export default class NaviFacts extends NativeWithCreate {
  constructor(injector: Injector, args: NaviFactsPayload) {
    super(injector, args);
  }

  @ClientService('navi-facts')
  protected declare factService: FactService;

  declare request: RequestV2;

  declare response: NaviFactResponse;

  /**
   * @returns Promise with the response model object for previous page or null when trying to access pages less than the first page
   */
  previous(): Promise<NaviFacts | null> {
    return this.factService.fetchPrevious.perform(this.response, this.request);
  }

  /**
   * @returns Promise with the response model object for next page or null when trying to go past last page
   */
  next(): Promise<NaviFacts | null> {
    return this.factService.fetchNext.perform(this.response, this.request);
  }
}
