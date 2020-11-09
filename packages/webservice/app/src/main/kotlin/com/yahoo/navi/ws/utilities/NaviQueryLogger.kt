/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.utilities

import com.google.common.collect.Iterables
import com.yahoo.elide.datastores.aggregation.core.QueryLogger
import com.yahoo.elide.datastores.aggregation.core.QueryResponse
import com.yahoo.elide.datastores.aggregation.query.Query
import com.yahoo.elide.security.User
import com.yahoo.navi.ws.models.beans.utilities.QueryStats
import com.yahoo.navi.ws.models.beans.utilities.QueryStatus
import java.net.InetAddress.getLocalHost
import java.util.Optional
import java.util.Timer
import java.util.TimerTask
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext
import javax.transaction.Transactional
import javax.ws.rs.core.MultivaluedMap

object Constants {
    const val MAX_QUERIES = 5
    const val TIMEOUT = 10000
}

@Transactional
open class NaviQueryLogger constructor(
    maxQueries: Int = Constants.MAX_QUERIES,
    timeOut: Long = Constants.TIMEOUT.toLong()
) : QueryLogger, TimerTask() {

    private var queriesToBeLogged: MutableList<QueryStats> = ArrayList()
    private var queryWatcher: MutableMap<UUID, QueryStats> = ConcurrentHashMap()

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    private var t: Timer = Timer()
    private val maxQueries: Int = maxQueries
    private val timeOut: Long = timeOut

    init {
        t.schedule(this, 0, this.timeOut)
    }

    override fun cancelQuery(queryId: UUID) {
        var endTime: Long = System.currentTimeMillis()
        var qstat: QueryStats = queryWatcher[queryId]!!
        synchronized(this) {
            qstat.status = QueryStatus.CANCELLED
            qstat.durationInMillis = endTime - qstat.startTime!!
            qstat.bytesReturned = 0
            qstat.rowsReturned = 0
            queriesToBeLogged.add(qstat)
            queryWatcher.remove(queryId)

            if (queriesToBeLogged.size > maxQueries) { run() }
        }
    }

    override fun acceptQuery(
        queryId: UUID,
        user: User?,
        headers: MutableMap<String, String>?,
        apiVer: String?,
        queryParams: Optional<MultivaluedMap<String, String>>,
        path: String?
    ) {
        var start: Long = System.currentTimeMillis()
        var apiQuery: String? = constructAPIQuery(queryParams, path)
        var userName: String? = user?.name

        var qStat = QueryStats(queryId)
        qStat.user = userName
        qStat.apiVersion = apiVer
        qStat.apiQuery = apiQuery
        qStat.startTime = start
        qStat.status = QueryStatus.ACCEPTED
        qStat.hostName = getLocalHost().hostName
        queryWatcher[queryId] = qStat
    }

    override fun completeQuery(queryId: UUID, response: QueryResponse) {
        var endTime: Long = System.currentTimeMillis()
        var qstat: QueryStats = queryWatcher[queryId]!!
        var status: QueryStatus = if (response.data == null) QueryStatus.FAILED else QueryStatus.COMPLETED
        synchronized(this) {
            qstat.status = status
            qstat.durationInMillis = endTime - qstat.startTime!!
            qstat.bytesReturned = getTotalBytesReturned(response)
            qstat.rowsReturned = getTotalRowsReturned(response)
            queriesToBeLogged.add(qstat)
            queryWatcher.remove(queryId)

            if (queriesToBeLogged.size > maxQueries) { run() }
        }
    }

    override fun processQuery(queryId: UUID, query: Query, apiQuery: MutableList<String>, isCached: Boolean) {
        var qstat: QueryStats = queryWatcher[queryId]!!

        qstat.modelName = query.scope.user.name
        qstat.storeQuery = apiQuery
        qstat.status = QueryStatus.INPROGRESS
        qstat.isCached = isCached
        queryWatcher[queryId] = qstat
    }

    override fun run() {
        synchronized(this) {
            for (qs in queriesToBeLogged) {
                entityManager.persist(qs)
            }
            queriesToBeLogged.clear()
        }
    }

    private fun constructAPIQuery(queryParams: Optional<MultivaluedMap<String, String>>, path: String?): String? {
        var apiQuery: String?
        if (!queryParams.isPresent) {
            apiQuery = path
        } else {
            apiQuery = "$path?"
            val qParams: MultivaluedMap<String, String> = queryParams.get()
            qParams.forEach { (key, value) ->
                run {
                    for (v in value) {
                        apiQuery += "$key=$v"
                    }
                }
            }
        }
        return apiQuery
    }

    private fun getTotalRowsReturned(response: QueryResponse): Int {
        if (response.data == null) { return 0 }
        val data: Iterable<Any> = response.data as Iterable<Any>
        return Iterables.size(data)
    }

    private fun getTotalBytesReturned(response: QueryResponse): Int {
        if (response.data == null) { return 0 }
        var totalBytes: Int = 0
        val data: Iterable<Any> = response.data as Iterable<Any>
        for (d in data) {
            totalBytes += d.toString().length
        }
        return totalBytes
    }
}
