/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments.request

import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type

data class Metric(
    var metric: String = "",

    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "java.utils.HashMap")
        ]
    ) var parameters: Map<String, String> = emptyMap()
)
