/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments.request

data class Having(
    var metric: String = "",
    var operator: String = "",
    var values: List<Double> = emptyList()
)
