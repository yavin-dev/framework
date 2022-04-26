/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.config

import com.yahoo.elide.Elide
import com.yahoo.elide.ElideSettingsBuilder
import com.yahoo.elide.RefreshableElide
import com.yahoo.elide.annotation.LifeCycleHookBinding
import com.yahoo.elide.core.TransactionRegistry
import com.yahoo.elide.core.datastore.DataStore
import com.yahoo.elide.core.dictionary.EntityDictionary
import com.yahoo.elide.core.filter.dialect.RSQLFilterDialect
import com.yahoo.elide.spring.config.ElideConfigProperties
import com.yahoo.navi.ws.models.beans.User
import com.yahoo.navi.ws.models.hooks.UserValidationHook
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.TimeZone

@Configuration
class ElideConfig {
    @Bean
    fun initializeElide(dictionary: EntityDictionary, dataStore: DataStore, settings: ElideConfigProperties): RefreshableElide {
        val builder = ElideSettingsBuilder(dataStore)
            .withEntityDictionary(dictionary)
            .withDefaultMaxPageSize(settings.maxPageSize)
            .withDefaultPageSize(settings.pageSize)
            .withJoinFilterDialect(RSQLFilterDialect.builder().dictionary(dictionary).build())
            .withSubqueryFilterDialect(RSQLFilterDialect.builder().dictionary(dictionary).build())
            .withAuditLogger(com.yahoo.elide.core.audit.Slf4jLogger())
            .withISO8601Dates("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("UTC"))
            .withJsonApiPath(settings.jsonApi.path)
            .withGraphQLApiPath(settings.graphql.path)
            .withExportApiPath(settings.async.export.path)
        return RefreshableElide(Elide(builder.build(), TransactionRegistry(), dictionary.getScanner(), true))
    }

    @Bean
    fun initializeUserValidationHook(refreshableElide: RefreshableElide): UserValidationHook {
        val dictionary = refreshableElide.elide.elideSettings.dictionary
        var userValidationHook: UserValidationHook = UserValidationHook()
        dictionary.bindTrigger(User::class.java, LifeCycleHookBinding.Operation.CREATE, LifeCycleHookBinding.TransactionPhase.PRECOMMIT, userValidationHook, true)
        return userValidationHook
    }
}
