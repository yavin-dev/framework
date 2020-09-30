/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.ComputedRelationship
import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.elide.core.exceptions.InvalidValueException
import com.yahoo.navi.ws.models.beans.fragments.DashboardWidgetVisualization
import com.yahoo.navi.ws.models.beans.fragments.Request
import com.yahoo.navi.ws.models.checks.DefaultAuthorCheck.Companion.IS_AUTHOR
import com.yahoo.navi.ws.models.checks.DefaultEditorsCheck.Companion.IS_EDITOR
import com.yahoo.navi.ws.models.checks.DefaultNobodyCheck.Companion.NOBODY
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type
import org.hibernate.annotations.UpdateTimestamp
import java.util.Date
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Temporal
import javax.persistence.TemporalType
import javax.persistence.Transient

@Entity
@Include(rootLevel = false, type = "dashboardWidgets")
@CreatePermission(expression = "$IS_AUTHOR OR $IS_EDITOR")
@UpdatePermission(expression = "$IS_AUTHOR OR $IS_EDITOR")
@DeletePermission(expression = "$IS_AUTHOR OR $IS_EDITOR")
class DashboardWidget : HasAuthor, HasEditors {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0

    var title: String? = null

    override var author: User?
        @Transient
        @ManyToOne
        @ComputedRelationship
        get() = this.dashboard!!.author
        set(_) {
            throw InvalidValueException("Cannot edit author directly through a widget bean. The owning dashboard contains the author")
        }

    override var editors: MutableSet<User>
        @Transient
        get() = this.dashboard!!.editors
        set(_) {
            throw InvalidValueException("Cannot edit editors directly through a widget bean. The owning dashboard contains the editors list")
        }

    @JoinColumn(name = "dashboard")
    @ManyToOne
    var dashboard: Dashboard? = null

    @CreationTimestamp
    @Column(columnDefinition = "timestamp default current_timestamp")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdatePermission(expression = NOBODY)
    var createdOn: Date? = null

    @UpdateTimestamp
    @Column(columnDefinition = "timestamp default current_timestamp")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdatePermission(expression = NOBODY)
    var updatedOn: Date? = null

    @Column(name = "requests", columnDefinition = "MEDIUMTEXT")
    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "java.util.ArrayList")
        ]
    )
    var requests: ArrayList<Request> = arrayListOf()

    @Column(name = "visualization", columnDefinition = "MEDIUMTEXT")
    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.DashboardWidgetVisualization")
        ]
    )
    var visualization: DashboardWidgetVisualization? = null
}
