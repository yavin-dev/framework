package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.beans.fragments.request.Dimension
import com.yahoo.navi.ws.models.types.JsonType
import org.hibernate.annotations.TypeDef

import com.yahoo.navi.ws.models.beans.fragments.request.Interval
import com.yahoo.navi.ws.models.beans.fragments.request.Filter
import com.yahoo.navi.ws.models.beans.fragments.request.Having
import com.yahoo.navi.ws.models.beans.fragments.request.LogicalTable
import com.yahoo.navi.ws.models.beans.fragments.request.Metric
import com.yahoo.navi.ws.models.beans.fragments.request.Sort

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@TypeDef(typeClass = JsonType::class, name = "json")
data class Request(
    var intervals: Array<Interval>,
    var filters: Array<Filter>,
    var dimensions: Array<Dimension>,
    var metrics: Array<Metric>,
    var logicalTable: LogicalTable,
    var sorts: Array<Sort>,
    var having: Array<Having>,

    var bardVersion: String,
    var requestVersion: String
)