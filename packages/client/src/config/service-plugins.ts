/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { Injector } from '../models/native-with-create.js';
import type RequestDecoratorService from '../services/interfaces/request-decorator.js';
import type MetadataService from '../services/interfaces/metadata.js';
import type FactService from '../services/interfaces/fact.js';
import type DimensionService from '../services/interfaces/dimension.js';
import type FormatterService from '../services/interfaces/formatter.js';
import type { ReturnTypesOfObject } from '../utils/types.js';
import type { Debugger } from 'debug';

export interface ServicePlugins {
  requestDecorator: (injector: Injector) => RequestDecoratorService;
  formatter: (injector: Injector) => FormatterService;
  metadata: (injector: Injector) => MetadataService;
  facts: (injector: Injector) => FactService;
  dimensions: (injector: Injector) => DimensionService;
  logger: (injector: Injector) => Debugger;
}

export type Services = ReturnTypesOfObject<ServicePlugins>;
