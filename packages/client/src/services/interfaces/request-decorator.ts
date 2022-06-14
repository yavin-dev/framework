/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { Request } from '../../request.js';

export default interface RequestDecoratorService {
  applyGlobalDecorators(request: Request): Request;
}

declare module './registry' {
  export default interface ServiceRegistry {
    'request-decorator': RequestDecoratorService;
  }
}
