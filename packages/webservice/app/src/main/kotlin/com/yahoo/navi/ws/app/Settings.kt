/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app

import com.yahoo.elide.standalone.config.ElideStandaloneSettings
import com.yahoo.elide.security.checks.Check
import com.yahoo.navi.ws.app.filters.CorsFilter
import com.yahoo.navi.ws.app.filters.UserAuthFilter
import com.yahoo.navi.ws.models.permissions.PermissionExpressions

open class Settings : ElideStandaloneSettings {
    override fun getCheckMappings(): MutableMap<String, Class<out Check<out Any>>> {
        return PermissionExpressions.expressions
    }

    override fun getFilters(): MutableList<Class<out Any>> {
        return mutableListOf(UserAuthFilter::class.java, CorsFilter::class.java)
    }

    override fun getModelPackageName(): String {
        return "com.yahoo.navi.ws.models.beans"
    }
}