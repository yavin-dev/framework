package com.yahoo.navi.ws.models.beans.fragments.request

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
data class Having(
    var metric: String,
    var operator: String,
    var values: Array<Double>
)