package com.yahoo.navi.ws.app

import com.yahoo.elide.standalone.config.ElideStandaloneSettings
import com.yahoo.elide.security.checks.Check
import com.yahoo.navi.ws.app.beans.ArtifactGroup
import com.yahoo.navi.ws.models.permissions.PermissionExpressions

class Settings : ElideStandaloneSettings {
    override fun getCheckMappings(): MutableMap<String, Class<out Check<out Any>>> {
        return PermissionExpressions.expressions;
    }

    override fun getModelPackageName(): String {
        return "com.yahoo.navi.ws.models.beans"
    }
}