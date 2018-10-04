package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.ComputedAttribute
import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.OnCreatePreCommit
import com.yahoo.elide.annotation.OnCreatePreSecurity
import com.yahoo.elide.annotation.OnUpdatePreSecurity
import com.yahoo.elide.annotation.ReadPermission
import com.yahoo.elide.annotation.SharePermission
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.elide.core.exceptions.InvalidValueException
import com.yahoo.navi.ws.models.utils.singularize
import com.yahoo.navi.ws.models.beans.enums.DeliveryFrequency
import com.yahoo.navi.ws.models.beans.fragments.DeliveredReportFormat
import com.yahoo.navi.ws.models.beans.fragments.SchedulingRules
import com.yahoo.navi.ws.models.utils.FormatDate
import org.hibernate.annotations.Generated
import org.hibernate.annotations.GenerationTime
import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type
import java.util.Date
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne

import javax.persistence.Table
import javax.persistence.Temporal
import javax.persistence.TemporalType
import javax.persistence.Transient
import javax.validation.ConstraintViolation
import javax.validation.Validation
import javax.validation.constraints.Size

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
@Entity
@Include(rootLevel = true, type = "deliveryRules")
@Table(name = "delivery_rules")
@SharePermission
@CreatePermission(expression = "delivery rule owned by same user")
@UpdatePermission(expression = "delivery rule owned by same user now")
@DeletePermission(expression = "delivery rule owned by same user now")
class DeliveryRule {
    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null

    @get:UpdatePermission(expression = "nobody")
    var deliveredType: String? = null

    @get:Column(columnDefinition = "TINYINT")
    @get:Enumerated(EnumType.ORDINAL)
    var frequency: DeliveryFrequency? = null

    @get:Column(name = "recipients", columnDefinition = "TEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = arrayOf(
            Parameter(name = "class", value = "java.util.ArrayList" )
    ))
    @get:Size(min = 1)
    var recipients: Collection<String> = arrayListOf()

    @get:Column(name = "format", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = arrayOf(
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.DeliveredReportFormat" )
    ))
    var format: DeliveredReportFormat = DeliveredReportFormat()

    @get:Column(name = "rules", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters = arrayOf(
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.SchedulingRules" )
    ))
    var schedulingRules: SchedulingRules? = null

    @get:Column(columnDefinition = "TINYINT")
    var version: Short = 1

    @get:ManyToOne
    @get:JoinColumn(name = "owner")
    var owner: User? = null

    @get:ManyToOne
    var deliveredItem: Asset? = null
        set(value) {
            field = value
            this.deliveredType = singularize(value!!::class.java.getAnnotation(Include::class.java).type)
        }

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

    /**
     * JSR 303 support hack. Will put in PR to Elide to support this without this work around
     */
    @OnCreatePreSecurity
    @OnUpdatePreSecurity("recipients")
    fun onCommit() {
        val validator = Validation.buildDefaultValidatorFactory().validator
        val constraintViolations = validator.validate(this)
        if (!constraintViolations.isEmpty()) {
            throw InvalidValueException("" + constraintViolations.map<ConstraintViolation<DeliveryRule>, String>{ violation -> violation.message }.joinToString(","))
        }
    }

    /**
     * Validate that the user can only own one DeliveryRule per DeliverableItem(Report or Dashboard)
     */
    @OnCreatePreCommit
    fun onePerDeliverable() {
        val item = this.deliveredItem
        for (rule in item!!.deliveryRules) {
            if (rule.id != this.id && rule.owner!!.id.equals(this.owner!!.id)) {
                throw InvalidValueException("Cannot have the same user have more than one delivery rule on a single deliverable item")
            }
        }
    }
}