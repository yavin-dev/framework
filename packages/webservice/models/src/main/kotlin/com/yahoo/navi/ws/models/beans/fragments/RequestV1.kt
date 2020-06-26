/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonInclude
import com.yahoo.navi.ws.models.beans.fragments.request.Dimension
import com.yahoo.navi.ws.models.beans.fragments.request.Filter
import com.yahoo.navi.ws.models.beans.fragments.request.Having
import com.yahoo.navi.ws.models.beans.fragments.request.Interval
import com.yahoo.navi.ws.models.beans.fragments.request.LogicalTable
import com.yahoo.navi.ws.models.beans.fragments.request.Metric
import com.yahoo.navi.ws.models.beans.fragments.request.Sort
import com.yahoo.navi.ws.models.types.JsonType
import org.hibernate.annotations.TypeDef

@JsonInclude(JsonInclude.Include.NON_NULL)
@TypeDef(typeClass = JsonType::class, name = "json")
data class RequestV1(
    var intervals: List<Interval> = emptyList(),
    var filters: List<Filter> = emptyList(),
    var dimensions: List<Dimension> = emptyList(),
    var metrics: List<Metric> = emptyList(),
    var logicalTable: LogicalTable = LogicalTable(),
    var sort: List<Sort> = emptyList(),
    var having: List<Having> = emptyList(),
    var dataSource: String? = null,
    var bardVersion: String = "v1",
    val requestVersion: String = "v1"
) : Request
