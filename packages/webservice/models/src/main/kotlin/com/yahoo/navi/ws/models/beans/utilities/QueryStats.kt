/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.utilities

import com.sun.istack.NotNull
import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.navi.ws.models.checks.DefaultNobodyCheck
import org.hibernate.annotations.CreationTimestamp
import java.util.Date
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table
import javax.persistence.Temporal
import javax.persistence.TemporalType

@Entity
@Include(rootLevel = true)
@Table(name = "querystats")
@CreatePermission(expression = DefaultNobodyCheck.NOBODY)
@UpdatePermission(expression = DefaultNobodyCheck.NOBODY)
@DeletePermission(expression = DefaultNobodyCheck.NOBODY)
class QueryStats(id: UUID){

    @Id
    @NotNull
    var id: UUID = id

    var name: String? = null
    var label: String? = null
    var sessionId: String? = null
    var fromUI: Boolean? = null

    @Column(columnDefinition = "user API version")
    var apiVersion: String? = null

    @Column(columnDefinition = "API query query string")
    var apiQuery: String? = null

    @Column(columnDefinition = "underlying SQL query")
    var storeQuery: String? = null

    @Column(columnDefinition = "underlying base table name")
    var modelName: String? = null

    @Column(columnDefinition = "user information")
    var user: String? = null

    @Column(columnDefinition = "current query state")
    var status: QueryStatus? = null

    @Column(columnDefinition = "query execution time")
    var durationInMillis: Long? = null

    @Column(columnDefinition = "output rows returned")
    var rowsReturned: Int? = null

    @Column(columnDefinition = "output bytes returned")
    var bytesReturned: Int? = null

    @Column(columnDefinition = "query comes form cache or not")
    var isCached: Boolean = false

    @CreationTimestamp
    @Column(columnDefinition = "timestamp default current_timestamp", name = "CreatedDate", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    var createdOn: Date? = null

    @Column(columnDefinition = "user system hostname")
    var hostName: String? = null

    @Transient
    var startTime: Long? = null
}