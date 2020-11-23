/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.config

import com.yahoo.elide.Elide
import com.yahoo.elide.ElideSettingsBuilder
import com.yahoo.elide.core.datastore.DataStore
import com.yahoo.elide.core.dictionary.EntityDictionary
import com.yahoo.elide.core.filter.dialect.RSQLFilterDialect
import com.yahoo.elide.spring.config.ElideConfigProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.TimeZone

@Configuration
class ElideConfig {
    @Bean
    fun initializeElide(dictionary: EntityDictionary, dataStore: DataStore, settings: ElideConfigProperties): Elide {
        val builder = ElideSettingsBuilder(dataStore)
            .withEntityDictionary(dictionary)
            .withDefaultMaxPageSize(settings.maxPageSize)
            .withDefaultPageSize(settings.pageSize)
            .withJoinFilterDialect(RSQLFilterDialect(dictionary))
            .withSubqueryFilterDialect(RSQLFilterDialect(dictionary))
            .withAuditLogger(com.yahoo.elide.core.audit.Slf4jLogger())
            .withISO8601Dates("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("UTC"))
        return Elide(builder.build())
    }
}
