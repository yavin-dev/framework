/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments.request

import com.yahoo.navi.ws.models.beans.enums.ColumnarType

data class DashboardFilter(
    var dimension: String = "",
    var operator: String = "",
    var values: List<String> = emptyList(),
    var field: String = "",
    var type: ColumnarType? = null,
)
