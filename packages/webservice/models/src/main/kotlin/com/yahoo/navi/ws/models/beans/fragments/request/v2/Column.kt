/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments.request.v2

import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.beans.enums.ColumnType
import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type

@JsonInclude(JsonInclude.Include.NON_NULL)
data class Column(
    var field: String,
    @get: Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = [
        Parameter(name = "class", value = "kotlin.collections.HashMap")
    ]) var parameters: Map<String, String>,
    var type: ColumnType?,
    var alias: String?
) {
    constructor() : this(
            "",
            emptyMap(),
            null,
            null
    )
}