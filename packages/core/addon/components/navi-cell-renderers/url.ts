/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::Url
 *   @data={{this.row}}
 *   @column={{this.column}}
 *   @request={{this.request}}
 *   @isRollup={{@isRollup}}
 *   @isGrandTotal={{@isGrandTotal}}
 * />
 */

import DimensionCellRenderer from './dimension';

export default class URLCellRenderer extends DimensionCellRenderer {}
