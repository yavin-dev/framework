/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A collection of function parameters that has a one to many relationship to columns
 */
import EmberObject from '@ember/object';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import { matches } from 'lodash-es';

type ConstrainableProperties = 'filters' | 'columns';

type ExistenceConstraintForType<Type extends ConstrainableProperties> = {
  property: Type;
  matches: Pick<RequestV2[Type][number], 'type' | 'field'>;
};
type ExistenceConstraint = ExistenceConstraintForType<'filters'> | ExistenceConstraintForType<'columns'>;

export interface RequestConstraintMetadataPayload {
  id: string;
  name: string;
  description?: string;
  type: 'existence';
  constraint: ExistenceConstraint;
  source: string;
}
export type RequestConstraintMetadata = RequestConstraintMetadataPayload;

export default class RequestConstraintMetadataModel
  extends EmberObject
  implements RequestConstraintMetadataPayload, RequestConstraintMetadata {
  id!: string;
  name!: string;
  description?: string | undefined;
  type!: 'existence';
  constraint!: ExistenceConstraint;
  source!: string;

  isSatisfied(request: RequestV2): boolean {
    const { property, matches: partialProperties } = this.constraint;
    return request[property].some(matches(partialProperties));
  }
}

declare module './registry' {
  export default interface MetadataModelRegistry {
    requestConstraint: RequestConstraintMetadataModel;
  }
}
