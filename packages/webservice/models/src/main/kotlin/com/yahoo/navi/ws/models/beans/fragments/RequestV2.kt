/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.beans.fragments.request.v2.Column
import com.yahoo.navi.ws.models.beans.fragments.request.v2.Filter
import com.yahoo.navi.ws.models.beans.fragments.request.v2.Sort
import com.yahoo.navi.ws.models.types.JsonType
import org.hibernate.annotations.TypeDef

@JsonInclude(JsonInclude.Include.NON_NULL)
@TypeDef(typeClass = JsonType::class, name = "json")
data class RequestV2(
    var filters: Array<Filter>,
    var columns: Array<Column>,
    var table: String,
    var sorts: Array<Sort>,
    var limit: Int?,
    var dataSource: String?,
    val requestVersion: String
) : Request {
    constructor() : this(
            emptyArray(),
            emptyArray(),
            "",
            emptyArray(),
            null,
            null,
            "2.0"
    )
}