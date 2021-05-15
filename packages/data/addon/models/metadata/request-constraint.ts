/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A collection of function parameters that has a one to many relationship to columns
 */
import NativeWithCreate from 'navi-data/models/native-with-create';
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

export default class RequestConstraintMetadataModel extends NativeWithCreate {
  constructor(owner: unknown, args: RequestConstraintMetadataPayload) {
    super(owner, args);
  }
  declare id: string;
  declare name: string;
  declare description?: string;
  declare type: 'existence';
  declare constraint: ExistenceConstraint;
  declare source: string;

  isSatisfied(request: RequestV2): boolean {
    const { property, matches: partialProperties } = this.constraint;
    return request[property].some(matches(partialProperties));
  }
}

declare module 'navi-data/models/metadata/registry' {
  export default interface MetadataModelRegistry {
    requestConstraint: RequestConstraintMetadataModel;
  }
}
