/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app

import com.yahoo.elide.standalone.config.ElideStandaloneSettings
import com.yahoo.elide.security.checks.Check
import com.yahoo.navi.ws.app.filters.CorsFilter
import com.yahoo.navi.ws.app.filters.UserAuthFilter
import com.yahoo.navi.ws.models.permissions.PermissionExpressions
import java.util.TimeZone
import com.yahoo.elide.core.filter.dialect.RSQLFilterDialect
import com.yahoo.elide.ElideSettingsBuilder
import com.yahoo.elide.core.EntityDictionary
import com.yahoo.elide.standalone.datastore.InjectionAwareHibernateStore
import org.glassfish.hk2.api.ServiceLocator
import com.yahoo.elide.ElideSettings
import com.yahoo.elide.standalone.Util




open class Settings : ElideStandaloneSettings {
     override fun getElideSettings(injector: ServiceLocator): ElideSettings {
        val dataStore = InjectionAwareHibernateStore(
                injector, Util.getSessionFactory(hibernate5ConfigPath, modelPackageName))
        val dictionary = EntityDictionary(checkMappings)

        var builder = ElideSettingsBuilder(dataStore)
                .withUseFilterExpressions(true)
                .withEntityDictionary(dictionary)
                .withJoinFilterDialect(RSQLFilterDialect(dictionary))
                .withSubqueryFilterDialect(RSQLFilterDialect(dictionary))

        if (enableIS06081Dates()) {
            builder = builder.withISO8601Dates("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("UTC"))
        }

        return builder.build()
    }

    override fun getCheckMappings(): MutableMap<String, Class<out Check<out Any>>> {
        return PermissionExpressions.expressions
    }

    override fun getFilters(): MutableList<Class<out Any>> {
        return mutableListOf(UserAuthFilter::class.java, CorsFilter::class.java)
    }

    override fun getModelPackageName(): String {
        return "com.yahoo.navi.ws.models.beans"
    }

    override fun getHibernate5ConfigPath(): String {
        return "./src/main/resources/hibernate.cfg.xml"
    }
}