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
    var intervals: Array<Interval> = arrayOf(),
    var filters: Array<Filter> = arrayOf(),
    var dimensions: Array<Dimension> = arrayOf(),
    var metrics: Array<Metric> = arrayOf(),
    var logicalTable: LogicalTable,
    var sort: Array<Sort> = arrayOf(),
    var having: Array<Having> = arrayOf(),

    var bardVersion: String,
    var requestVersion: String
) {
    constructor() : this(
        arrayOf<Interval>(),
        arrayOf<Filter>(),
        arrayOf<Dimension>(),
        arrayOf<Metric>(),
        LogicalTable("",""),
        arrayOf<Sort>(),
        arrayOf<Having>(), "v1", "v1"
    )
}