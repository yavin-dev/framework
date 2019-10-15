/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app

import com.yahoo.elide.ElideSettings
import com.yahoo.elide.ElideSettingsBuilder
import com.yahoo.elide.contrib.swagger.SwaggerBuilder
import com.yahoo.elide.core.EntityDictionary
import com.yahoo.elide.core.filter.dialect.RSQLFilterDialect
import com.yahoo.elide.datastores.jpa.JpaDataStore
import com.yahoo.elide.datastores.jpa.transaction.NonJtaTransaction
import com.yahoo.elide.security.checks.Check
import com.yahoo.elide.standalone.Util
import com.yahoo.elide.standalone.config.ElideStandaloneSettings
import com.yahoo.navi.ws.app.filters.CorsFilter
import com.yahoo.navi.ws.app.filters.UserAuthFilter
import com.yahoo.navi.ws.models.beans.Dashboard
import com.yahoo.navi.ws.models.beans.DashboardWidget
import com.yahoo.navi.ws.models.beans.Report
import com.yahoo.navi.ws.models.beans.User
import com.yahoo.navi.ws.models.permissions.PermissionExpressions
import io.swagger.models.Info
import io.swagger.models.Swagger
import org.eclipse.jetty.servlet.ServletContextHandler
import org.eclipse.jetty.servlet.ServletHolder
import org.glassfish.hk2.api.ServiceLocator
import java.io.IOException
import java.util.Properties
import java.util.TimeZone
import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import kotlin.collections.HashMap

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

    /**
     * Runs swagger on <host>/swagger/doc/api
     */
    override fun enableSwagger(): Map<String, Swagger> {
        val dictionary = EntityDictionary(HashMap())

        dictionary.bindEntity(Dashboard::class.java)
        dictionary.bindEntity(DashboardWidget::class.java)
        dictionary.bindEntity(Report::class.java)
        dictionary.bindEntity(User::class.java)
        val info = Info().title("Navi webservice").version("0.2.0")

        val builder = SwaggerBuilder(dictionary, info)
        val swagger = builder.build().basePath("/api/v1")

        val docs = HashMap<String, Swagger>()
        docs["api"] = swagger
        return docs
    }

    /**
     * Loads the hibernate.properties file
     */
    fun loadHibernateProperties(): Properties {
        val propertiesFile = "/hibernate.properties"

        val properties = Properties()
        try {
            javaClass.getResourceAsStream(propertiesFile).use {
                properties.load(it)
            }

            return properties
        } catch (e: IOException) {
            throw RuntimeException("Could not load $propertiesFile", e)
        }
    }

    override fun updateServletContextHandler(servletContextHandler: ServletContextHandler?) {
        val holderPwd = ServletHolder("default", SwaggerUIServlet::class.java)
        servletContextHandler?.addServlet(holderPwd, "/")
    }

    class SwaggerUIServlet : HttpServlet() {
        override fun doGet(request: HttpServletRequest, response: HttpServletResponse) {
            val file = request.requestURI.let {
                if (!it.endsWith("/")) it else "${it}index.html"
            }

            javaClass.getResourceAsStream(file).use {
                it.copyTo(response.outputStream)
            }
        }
    }
}