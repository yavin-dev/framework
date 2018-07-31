package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.ComputedAttribute
import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.ReadPermission
import com.yahoo.elide.annotation.SharePermission
import com.yahoo.elide.annotation.UpdatePermission
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
@Include(rootLevel = true, type = "reports")
@Table(name = "custom_reports")
@SharePermission(expression = "everybody")
@CreatePermission(expression = "is an author")
@UpdatePermission(expression = "is an author now")
@DeletePermission(expression = "is an author now")
class Report : HasAuthor {

    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0

    var title: String? = null

    @get:JoinColumn(name = "author")
    @get:ManyToOne
    override var author: User? = null

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

    @get:Column(name = "request", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters =
        arrayOf(Parameter(name = "class", value = "com.yahoo.uad.ui.persistence.models.fragments.Request")))
    var request: Request? = null
}