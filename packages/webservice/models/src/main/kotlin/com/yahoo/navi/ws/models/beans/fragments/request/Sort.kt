package com.yahoo.navi.ws.models.beans.fragments.request

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
data class Sort(
    var metric: String,
    var direction: String
) {
    constructor(): this("", "")
}