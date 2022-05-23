/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NativeWithCreate, { ClientService, Injector } from 'navi-data/models/native-with-create';
import { Cardinality } from '@yavin/client/utils/enums/cardinality-sizes';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type MetricMetadataModel from 'navi-data/models/metadata/metric';
import type RequestConstraintMetadataModel from 'navi-data/models/metadata/request-constraint';
import type TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';

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
  declare naviMetadata: NaviMetadataService;

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
    return this.metricIds.map((id) => this.naviMetadata.getById('metric', id, this.source)).filter(isPresent);
  }

  get dimensions(): DimensionMetadataModel[] {
    return this.dimensionIds.map((id) => this.naviMetadata.getById('dimension', id, this.source)).filter(isPresent);
  }

  get timeDimensions(): TimeDimensionMetadataModel[] {
    return this.timeDimensionIds
      .map((id) => this.naviMetadata.getById('timeDimension', id, this.source))
      .filter(isPresent);
  }

  get requestConstraints(): RequestConstraintMetadataModel[] {
    return this.requestConstraintIds
      .map((id) => this.naviMetadata.getById('requestConstraint', id, this.source))
      .filter(isPresent);
  }
}

declare module 'navi-data/models/metadata/registry' {
  export default interface MetadataModelRegistry {
    table: TableMetadataModel;
  }
}
