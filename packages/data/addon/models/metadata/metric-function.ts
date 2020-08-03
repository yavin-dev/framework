/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A collection of function arguments that has a one to many relationship to metrics
 */
import EmberObject from '@ember/object';
import FunctionArgument, { FunctionArgumentMetadataPayload } from './function-argument';

export interface MetricFunctionMetadataPayload {
  id: string;
  name: string;
  description?: string;
  source: string;
  arguments?: FunctionArgumentMetadataPayload[];
}

export default class MetricFunctionMetadataModel extends EmberObject implements MetricFunctionMetadataPayload {
  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {string} id
   */
  id!: string;

  /**
   * @property {string} name
   */
  name!: string;

  /**
   * @property {string} description
   */
  description?: string;

  /**
   * @property {string} source
   */
  source!: string;

  /**
   * @property {FunctionArgument[]} - Function argument instances related to this metric function
   */
  arguments!: FunctionArgument[];
}
