package com.yahoo.navi.ws.models.beans.fragments.request

import org.hibernate.annotations.Type
import org.hibernate.annotations.Parameter

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
data class Metric(
    var metric: String,

    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = [
        Parameter(name = "class", value = "kotlin.collections.HashMap")
    ]) var parameters: Map<String, String>
)