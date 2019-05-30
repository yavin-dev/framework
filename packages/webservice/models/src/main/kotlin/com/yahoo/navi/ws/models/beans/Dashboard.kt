/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.SharePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.navi.ws.models.beans.fragments.DashboardPresentation
import com.yahoo.navi.ws.models.beans.fragments.request.Filter

import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type
import javax.persistence.CascadeType

import javax.persistence.Entity
import javax.persistence.Table
import javax.persistence.Column
import javax.persistence.DiscriminatorValue
import javax.persistence.ManyToMany
import javax.persistence.OneToMany

@Entity(name = "Dashboard")
@DiscriminatorValue("Dashboard")
@Table(name="custom_dashboards")
@Include(rootLevel = true, type = "dashboards")
@SharePermission
@CreatePermission(expression = "is an author")
@UpdatePermission(expression = "is an author now OR is an editor now")
@DeletePermission(expression = "is an author now")
class Dashboard : Asset(), HasAuthor, HasEditors {

    @get:ManyToMany(mappedBy = "editingDashboards")
    override var editors: Collection<User> = arrayListOf()

    @get:Column(name = "presentation", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = arrayOf(
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.DashboardPresentation")
    ))
    var presentation: DashboardPresentation? = null

    @get:OneToMany(mappedBy = "dashboard", cascade = arrayOf(CascadeType.REMOVE), orphanRemoval = true)
    var widgets: Collection<DashboardWidget> = emptyList()

    @get:Column(name = "filters", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = arrayOf(
            Parameter(name = "class", value = "java.util.ArrayList")
    ))
    var filters: Collection<Filter> = emptyList()

}