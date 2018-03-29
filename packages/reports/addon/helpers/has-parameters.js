/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper } from '@ember/component/helper';
import { hasParameters } from 'navi-data/utils/metric';

export default helper(args => hasParameters(...args));
