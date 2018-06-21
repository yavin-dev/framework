package com.yahoo.navi.ws.app.beans;

import com.yahoo.elide.annotation.Include;

import javax.persistence.Entity;
import javax.persistence.Id;

@Include(rootLevel = true)
@Entity
class ArtifactGroup {
    @get:Id
    var name: String = "";
}