/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { RequestOptions } from '../../adapters/facts/interface.js';
import type { Request } from '../../request.js';
import type NaviFactsModel from '../../models/navi-facts.js';
import type NaviFactResponse from '../../models/navi-fact-response.js';

interface FactService {
  /**
   * Uses the adapter to get the query url for the request
   * @param request - request object
   * @param options - options object
   * @returns url for the request
   */
  getURL(request: Request, options: RequestOptions): string | undefined;

  /**
   * Uses the adapter to get the download query url for the request
   * @param request - request object
   * @param options - options object
   * @returns - url for the request
   */
  getDownloadURL(request: Request, options: RequestOptions): Promise<string>;

  /**
   * Returns the response model for the request
   * @param request - request object
   * @param options - options object
   * @returns - Promise with the bard response model object
   */
  fetch(request: Request, options: RequestOptions): Promise<NaviFactsModel>;

  /**
   * Returns the next page of the response model for the request
   * @param request - request object
   * @param options - options object
   * @return returns the promise with the next set of results or null
   */
  fetchNext(response: NaviFactResponse, request: Request): Promise<NaviFactsModel | null>;

  /**
   * Returns the previous page of the response model for the request
   * @param request - request object
   * @param options - options object
   * @return returns the promise with the previous set of results or null
   */
  fetchPrevious(response: NaviFactResponse, request: Request): Promise<NaviFactsModel | null>;
}

export default FactService;
