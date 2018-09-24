package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.ComputedAttribute
import com.yahoo.elide.annotation.ComputedRelationship
import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.ReadPermission
import com.yahoo.elide.annotation.SharePermission
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.elide.core.exceptions.InvalidValueException
import com.yahoo.navi.ws.models.beans.fragments.DashboardWidgetVisualization
import com.yahoo.navi.ws.models.beans.fragments.Request
import com.yahoo.navi.ws.models.utils.FormatDate
import org.hibernate.annotations.Generated
import org.hibernate.annotations.GenerationTime
import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type
import java.util.Date
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table
import javax.persistence.Temporal
import javax.persistence.TemporalType
import javax.persistence.Transient

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
@Entity
@Include(type = "dashboardWidgets")
@Table(name = "dashboard_widgets")
@SharePermission
@CreatePermission(expression = "is an author OR is an editor")
@UpdatePermission(expression = "is an author now OR is an editor now")
@DeletePermission(expression = "is an author now OR is an editor now")
class DashboardWidget: HasAuthor, HasEditors {
    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
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

    override var editors: Collection<User>
        @Transient
        get() = this.dashboard!!.editors
        set(_) {
            throw InvalidValueException("Cannot edit editors directly through a widget bean. The owning dashboard contains the editors list")
        }

    @get:JoinColumn(name = "dashboard")
    @get:ManyToOne
    var dashboard: Dashboard? = null

    @get:Generated(GenerationTime.INSERT)
    @get:Column(updatable = false, insertable = false, columnDefinition = "timestamp default current_timestamp")
    @get:Temporal(TemporalType.TIMESTAMP)
    @get:ReadPermission(expression = "nobody")
    @get:UpdatePermission(expression = "nobody")
    var createDate: Date? = null

    @get:Generated(GenerationTime.ALWAYS)
    @get:Column(updatable = false, insertable = false, columnDefinition = "timestamp default current_timestamp")
    @get:Temporal(TemporalType.TIMESTAMP)
    @get:ReadPermission(expression = "nobody")
    @get:UpdatePermission(expression = "nobody")
    var updateDate: Date? = null

    var createdOn: String? = null
        @Transient
        @ComputedAttribute
        get() = FormatDate.format(createDate)

    var updateOn: String? = null
        @Transient
        @ComputedAttribute
        get() = FormatDate.format(updateDate)

    @get:Column(name = "requests", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = arrayOf(
        Parameter(name = "class", value = "java.util.ArrayList")
    ))
    var requests: Collection<Request> = arrayListOf()

    @get:Column(name = "visualization", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = arrayOf(
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.DashboardWidgetVisualization")
    ))
    var visualization: DashboardWidgetVisualization? = null
}