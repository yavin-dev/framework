/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.types.JsonType
import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef

@JsonInclude(JsonInclude.Include.NON_NULL)
@TypeDef(typeClass = JsonType::class, name = "json")
data class DashboardWidgetVisualization(
    var type: String = "",
    var version: Int = 0,
    var namespace: String? = null,
    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "java.util.HashMap")
        ]
    )
    var metadata: Map<Any, Any> = emptyMap()
)
