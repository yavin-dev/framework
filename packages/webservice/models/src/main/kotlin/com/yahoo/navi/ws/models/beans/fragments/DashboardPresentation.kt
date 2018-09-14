package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.beans.fragments.layout.Layout
import com.yahoo.navi.ws.models.types.JsonType
import org.hibernate.annotations.TypeDef

/**
 * Copyright (c) 2018, Yahoo Inc.
 */

@JsonInclude(JsonInclude.Include.NON_NULL)
@TypeDef(typeClass = JsonType::class, name="json")
data class DashboardPresentation(
    var version: Int = 0,
    var layout: List<Layout> = arrayListOf(),
    var columns: Int = 0
) {
    constructor() :this(
            0,
            arrayListOf<Layout>(),
            0
    )
}