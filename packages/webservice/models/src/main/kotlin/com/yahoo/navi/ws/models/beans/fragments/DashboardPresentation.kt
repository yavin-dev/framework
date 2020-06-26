/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.beans.fragments.layout.Layout
import com.yahoo.navi.ws.models.types.JsonType
import org.hibernate.annotations.TypeDef

@JsonInclude(JsonInclude.Include.NON_NULL)
@TypeDef(typeClass = JsonType::class, name = "json")
data class DashboardPresentation(
    var version: Int = 0,
    var layout: List<Layout> = emptyList(),
    var columns: Int = 0
)
