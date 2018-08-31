package com.yahoo.navi.ws.models.beans.fragments.request

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
data class LogicalTable(
    var table: String,
    var timeGrain: String
) {
    constructor(): this("", "")
}