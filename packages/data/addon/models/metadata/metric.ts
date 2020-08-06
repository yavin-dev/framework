/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import ColumnMetadataModel, { BaseExtendedAttributes, ColumnMetadata, ColumnMetadataPayload } from './column';

// Shape of public properties on model
export interface MetricMetadata extends ColumnMetadata {
  defaultFormat?: string;
  extended: Promise<MetricMetadataModel & ExtendedAttributes>;
}
// Shape passed to model constructor
export interface MetricMetadataPayload extends ColumnMetadataPayload {
  defaultFormat?: string;
}

type ExtendedAttributes = BaseExtendedAttributes;
export default class MetricMetadataModel extends ColumnMetadataModel implements MetricMetadata, MetricMetadataPayload {
  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {Ember.Service} keg
   */
  @service('bard-metadata')
  metadataService!: TODO;

  /**
   * @property {string} defaultFormat - e.g. decimal for numbers
   */
  defaultFormat?: string;

  /**
   * @property {Promise} extended - extended metadata for the metric that isn't provided in initial table fullView metadata load
   */
  get extended(): Promise<MetricMetadataModel & ExtendedAttributes> {
    const { metadataService, id, source } = this;
    return metadataService.findById('metric', id, source);
  }
}
