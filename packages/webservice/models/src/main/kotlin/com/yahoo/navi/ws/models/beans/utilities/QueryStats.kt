/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.utilities

import com.sun.istack.NotNull
import com.yahoo.elide.annotation.Include
import com.yahoo.elide.datastores.aggregation.annotation.Cardinality
import com.yahoo.elide.datastores.aggregation.annotation.CardinalitySize
import com.yahoo.elide.datastores.aggregation.queryengines.sql.annotation.FromTable
import com.yahoo.elide.datastores.aggregation.queryengines.sql.annotation.VersionQuery
import lombok.EqualsAndHashCode
import lombok.ToString
import org.hibernate.annotations.CreationTimestamp
import java.util.Date
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
//import javax.persistence.Table
import javax.persistence.Temporal
import javax.persistence.TemporalType

@Include(rootLevel = true)
@Entity
@Cardinality(size = CardinalitySize.LARGE)
@VersionQuery(sql = "SELECT COUNT(*) from QueryStats")
@EqualsAndHashCode
@ToString
@FromTable(name = "QueryStats")
class QueryStats(id: UUID) {

    @Id
    @NotNull
    var requestId: UUID = id

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

/*
dimensions : [
{
    name: requestId
    type: TEXT
    definition: requestId
}
{
    name : apiVersion
    type : TEXT
    definition : IF (apiVersion IS NULL, 'Unknown', apiVersion)
}
{
    name : apiQuery
    type : TEXT
    definition : IF (apiQuery IS NULL, 'Unknown', apiQuery)
}
{
    name : storeQuery
    type : TEXT
    definition : IF (storeQuery IS NULL, 'Unknown', storeQuery)
}
{
    name : isCached
    type : BOOLEAN
    definition : DEFAULT (false)
}
{
    name : hostName
    type : TEXT
    definition : IF (hostName IS NULL, 'Unknown', hostName)
}
{
    name : createdOn
    type : TIME
    definition : createdOn
    grains: [
    {
        grain :  MONTH
        sql :  '''
        PARSEDATETIME(FORMATDATETIME({{}}, 'yyyy-MM-01'), 'yyyy-MM-dd')
        '''
    }
    ]
}
]
measures:
[
{
    name: modelName
    type: TEXT
    definition: IF (name IS NULL, 'Unknown', modelName)
}
{
    name: user
    type: TEXT
    definition: IF (user IS NULL, 'Unknown', user)
}
{
    name: status
    type: TEXT
    definition: IF (status IS NULL, 'Unknown', status)
}
{
    name: durationInMillis
    type: DECIMAL
    definition: IF (durationInMillis IS NULL, -1, durationInMillis)
}
{
    name: rowsReturned
    type: DECIMAL
    definition: IF (rowsReturned IS NULL, -1 , rowsReturned)
}
{
    name: bytesReturned
    type: DECIMAL
    definition: IF (bytesReturned IS NULL, -1, bytesReturned)
}
]
*/

/*
{
                    name: name
                    type: TEXT
                    definition: IF (name IS NULL, 'Unknown', name)
                }
                {
                    name: label
                    type: TEXT
                    definition: IF (label IS NULL, 'Unknown', label)
                }
                {
                    name: sessionId
                    type: TEXT
                    definition: IF (sessionId IS NULL, 'Unknown', sessionId)
                }
                {
                    name: fromUI
                    type: BOOLEAN
                    definition: IF (fromUI IS NULL, false, fromUI)
                }
 */