/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import debug from 'debug';
import type Debugger from './interfaces/logger.js';

export const LOG_NAMESPACE = 'yavin:client';
const Logger: Debugger = debug(LOG_NAMESPACE);

export default Logger;
