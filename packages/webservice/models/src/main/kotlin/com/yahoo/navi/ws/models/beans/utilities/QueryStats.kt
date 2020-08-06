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
class QueryStats(id: UUID) {

    @Id
    @NotNull
    var id: UUID = id

    var name: String? = null
    var label: String? = null
    var sessionId: String? = null
    var fromUI: Boolean? = null

    @Column
    var apiVersion: String? = null

    @Column
    var apiQuery: String? = null

    @Column
    var storeQuery: String? = null

    @Column
    var modelName: String? = null

    @Column
    var user: String? = null

    @Column
    var status: QueryStatus? = null

    @Column
    var durationInMillis: Long? = null

    @Column
    var rowsReturned: Int? = null

    @Column
    var bytesReturned: Int? = null

    @Column
    var isCached: Boolean = false

    @CreationTimestamp
    @Column(columnDefinition = "timestamp default current_timestamp", name = "CreatedDate", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    var createdOn: Date? = null

    @Column
    var hostName: String? = null

    @Transient
    var startTime: Long? = null
}
