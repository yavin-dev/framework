package com.yahoo.navi.ws.app;

import com.yahoo.elide.standalone.config.ElideStandaloneSettings;
import com.yahoo.navi.ws.app.beans.ArtifactGroup;

public class Settings implements ElideStandaloneSettings {
    @Override
    public String getModelPackageName() {
        return ArtifactGroup.class.getPackage().getName();
    }
}