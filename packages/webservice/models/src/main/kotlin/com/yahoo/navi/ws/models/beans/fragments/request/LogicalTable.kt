/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments.request

data class LogicalTable(
    var table: String,
    var timeGrain: String
) {
    constructor() : this("", "")
}