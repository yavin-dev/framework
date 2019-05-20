/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments.request

import org.hibernate.annotations.Type
import org.hibernate.annotations.Parameter

data class Metric(
    var metric: String,

    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = [
        Parameter(name = "class", value = "kotlin.collections.HashMap")
    ]) var parameters: Map<String, String>
) {
    constructor(): this("", emptyMap())
}