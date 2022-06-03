/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A collection of function parameters that has a one to many relationship to columns
 */
import NativeWithCreate, { Injector } from '../native-with-create.js';
import type { RequestV2 } from '../../request.js';
import matches from 'lodash/matches.js';

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
  constructor(injector: Injector, args: RequestConstraintMetadataPayload) {
    super(injector, args);
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

declare module './registry' {
  export default interface MetadataModelRegistry {
    requestConstraint: RequestConstraintMetadataModel;
  }
}
