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
import com.yahoo.elide.core.filter.dialect.RSQLFilterDialect
import com.yahoo.elide.ElideSettingsBuilder
import com.yahoo.elide.core.EntityDictionary
import org.glassfish.hk2.api.ServiceLocator
import com.yahoo.elide.ElideSettings
import com.yahoo.elide.standalone.Util
import com.yahoo.elide.datastores.jpa.transaction.NonJtaTransaction
import com.yahoo.elide.datastores.jpa.JpaDataStore
import java.io.FileInputStream
import java.io.IOException
import java.util.*


open class Settings : ElideStandaloneSettings {
     override fun getElideSettings(injector: ServiceLocator): ElideSettings {
         val entityManagerFactory = Util.getEntityManagerFactory(modelPackageName, loadHibernateProperties())
         val dataStore = JpaDataStore(
                 { entityManagerFactory.createEntityManager() },
                 { em -> NonJtaTransaction(em) })

         val dictionary = EntityDictionary(checkMappings, injector::inject)

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

    fun loadHibernateProperties(): Properties {
        // Load properties file
        val path = "./src/main/resources/hibernate.properties"
        val properties = Properties()
        try  {
            FileInputStream(path).use{
                properties.load(it)
            }

            return properties;
        } catch (e: IOException) {
            throw RuntimeException("Could not load " + path, e);
        }
    }
}