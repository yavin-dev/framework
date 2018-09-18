package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.ComputedAttribute
import com.yahoo.elide.annotation.ReadPermission
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.navi.ws.models.utils.FormatDate
import org.hibernate.annotations.Generated
import org.hibernate.annotations.GenerationTime
import java.util.*
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Temporal
import javax.persistence.TemporalType
import javax.persistence.Transient

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
abstract class Asset {
    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0

    var title: String? = null

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
}