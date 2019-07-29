/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.types.JsonType
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.Type
import org.hibernate.annotations.Parameter

@JsonInclude(JsonInclude.Include.NON_NULL)
@TypeDef(typeClass = JsonType::class, name = "json")
data class DashboardWidgetVisualization(
    var type: String = "",
    var version: Int = 0,
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = arrayOf(
            Parameter(name = "class", value = "kotlin.collections.HashMap")
    ))
    var metadata: Map<Any, Any> = emptyMap()
) {
    constructor() : this(
            "",
            0,
            emptyMap()
    )
}