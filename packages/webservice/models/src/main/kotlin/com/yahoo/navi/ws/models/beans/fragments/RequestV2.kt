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
    var filters: List<Filter> = emptyList(),
    var columns: List<Column> = emptyList(),
    var table: String = "",
    var sorts: List<Sort> = emptyList(),
    var limit: Int? = null,
    var dataSource: String? = null,
    val requestVersion: String = "2.0"
) : Request
