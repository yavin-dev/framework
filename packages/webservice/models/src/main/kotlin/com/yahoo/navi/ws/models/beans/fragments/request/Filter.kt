package com.yahoo.navi.ws.models.beans.fragments.request

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
data class Filter(
    var dimension: String,
    var operator: String,
    var values: Array<String>,
    var field: String
) {
    constructor(): this("", "", arrayOf<String>(), "")
}