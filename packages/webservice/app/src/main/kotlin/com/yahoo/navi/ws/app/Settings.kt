package com.yahoo.navi.ws.app;

import com.yahoo.elide.standalone.config.ElideStandaloneSettings;
import com.yahoo.navi.ws.app.beans.ArtifactGroup;

class Settings : ElideStandaloneSettings {
    override fun getModelPackageName(): String {
        return "com.yahoo.navi.ws.app.beans"
    }
}