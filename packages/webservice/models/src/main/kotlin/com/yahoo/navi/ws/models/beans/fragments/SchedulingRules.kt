package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.types.JsonType
import org.hibernate.annotations.TypeDef
import java.util.Date

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@TypeDef(typeClass = JsonType::class, name = "json")
data class SchedulingRules(
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        var stopAfter: Date? = null,
        var every: String = "",
        var waitFor3PSData: Boolean = false
) {
    constructor(): this(null, "", false)
}