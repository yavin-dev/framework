/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NativeWithCreate, { ClientService, Injector } from '../native-with-create.js';
import type { Cardinality } from '../../utils/enums/cardinality-sizes.js';
import type DimensionMetadataModel from './dimension.js';
import type MetricMetadataModel from './metric.js';
import type RequestConstraintMetadataModel from './request-constraint.js';
import type TimeDimensionMetadataModel from './time-dimension.js';
import type MetadataService from '../../services/interfaces/metadata.js';

// Shape passed to model constructor
export interface TableMetadataPayload {
  id: string;
  name: string;
  category?: string;
  description?: string;
  cardinality?: Cardinality;
  isFact: boolean;
  metricIds: string[];
  dimensionIds: string[];
  timeDimensionIds: string[];
  requestConstraintIds: string[];
  source: string;
  tags?: string[];
}

function isPresent<T>(t: T | undefined | null | void): t is T {
  return t !== undefined && t !== null;
}

export default class TableMetadataModel extends NativeWithCreate {
  constructor(injector: Injector, args: TableMetadataPayload) {
    super(injector, args);
  }
  static identifierField = 'id';

  @ClientService('navi-metadata')
  declare metadataService: MetadataService;

  declare id: string;

  declare name: string;

  declare description?: string;

  declare category?: string;

  declare cardinality: Cardinality;

  declare isFact: boolean;

  declare metricIds: string[];

  declare dimensionIds: string[];

  declare timeDimensionIds: string[];

  declare requestConstraintIds: string[];

  declare tags: string[];

  /**
   * the datasource this metadata is from.
   */
  declare source: string;

  get metrics(): MetricMetadataModel[] {
    return this.metricIds.map((id) => this.metadataService.getById('metric', id, this.source)).filter(isPresent);
  }

  get dimensions(): DimensionMetadataModel[] {
    return this.dimensionIds.map((id) => this.metadataService.getById('dimension', id, this.source)).filter(isPresent);
  }

  get timeDimensions(): TimeDimensionMetadataModel[] {
    return this.timeDimensionIds
      .map((id) => this.metadataService.getById('timeDimension', id, this.source))
      .filter(isPresent);
  }

  get requestConstraints(): RequestConstraintMetadataModel[] {
    return this.requestConstraintIds
      .map((id) => this.metadataService.getById('requestConstraint', id, this.source))
      .filter(isPresent);
  }
}

declare module './registry' {
  export default interface MetadataModelRegistry {
    table: TableMetadataModel;
  }
}
