/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

export type MetadataOptions = {
  query?: object;
  clientId?: string;
  timeout?: number;
  dataSourceName?: string;
};

export default interface NaviMetadataAdapter {
  /**
   * Bulk fetch of all metadata for a datasource
   * @param options
   */
  fetchEverything(options?: TODO): Promise<TODO>;

  /**
   * Fetch collection of metadata object
   * @param type - metadata type
   * @param options
   */
  fetchAll(type: string, options?: TODO): Promise<TODO>;

  /**
   * Fetch metadata object by id
   * @param type - metadata type
   * @param id - metadata identifier
   * @param options
   */
  fetchById(type: string, id: string, options?: MetadataOptions): Promise<TODO>;
}
