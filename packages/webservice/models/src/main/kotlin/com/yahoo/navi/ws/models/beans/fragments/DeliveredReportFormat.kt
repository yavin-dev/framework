package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.types.JsonType
import org.hibernate.annotations.TypeDef

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@TypeDef(name = "json", typeClass = JsonType::class)
data class DeliveredReportFormat(
        var type: String = ""
) {
    constructor(): this("")
}