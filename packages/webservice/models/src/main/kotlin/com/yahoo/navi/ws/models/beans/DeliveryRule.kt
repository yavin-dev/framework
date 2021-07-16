/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans

import EmailList
import com.yahoo.elide.annotation.ComputedAttribute
import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.navi.ws.models.beans.enums.DeliveryFrequency
import com.yahoo.navi.ws.models.beans.fragments.DeliveryFormat
import com.yahoo.navi.ws.models.beans.fragments.SchedulingRules
import com.yahoo.navi.ws.models.checks.DefaultAdminCheck
import com.yahoo.navi.ws.models.checks.DefaultNobodyCheck
import com.yahoo.navi.ws.models.checks.DefaultOwnerCheck
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type
import org.hibernate.annotations.UpdateTimestamp
import java.util.Date
import javax.persistence.Column
import javax.persistence.DiscriminatorValue
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Temporal
import javax.persistence.TemporalType
import javax.persistence.Transient
import javax.validation.constraints.NotEmpty
import javax.validation.constraints.NotNull
import javax.validation.constraints.Size

@Entity
@Include(name = "deliveryRules")
@DiscriminatorValue("deliveryRule")
@CreatePermission(expression = "${DefaultOwnerCheck.IS_OWNER} OR ${DefaultAdminCheck.IS_ADMIN}")
@UpdatePermission(expression = "${DefaultOwnerCheck.IS_OWNER} OR ${DefaultAdminCheck.IS_ADMIN}")
@DeletePermission(expression = "${DefaultOwnerCheck.IS_OWNER} OR ${DefaultAdminCheck.IS_ADMIN}")
class DeliveryRule : HasOwner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0

    @JoinColumn(name = "owner")
    @ManyToOne
    override var owner: User? = null

    @CreationTimestamp
    @Column(columnDefinition = "timestamp default current_timestamp")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdatePermission(expression = DefaultNobodyCheck.NOBODY)
    var createdOn: Date? = null

    @UpdateTimestamp
    @Column(columnDefinition = "timestamp default current_timestamp")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdatePermission(expression = DefaultNobodyCheck.NOBODY)
    var updatedOn: Date? = null

    @Temporal(TemporalType.TIMESTAMP)
    @CreatePermission(expression = DefaultNobodyCheck.NOBODY)
    @UpdatePermission(expression = DefaultAdminCheck.IS_ADMIN)
    var lastDeliveredOn: Date? = null

    @NotNull
    var frequency: DeliveryFrequency? = null

    @NotNull
    @Column(name = "format", columnDefinition = "MEDIUMTEXT")
    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.DeliveryFormat")
        ]
    )
    var format: DeliveryFormat? = null

    @Column(name = "scheduling_rules", columnDefinition = "MEDIUMTEXT")
    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.SchedulingRules")
        ]
    )
    var schedulingRules: SchedulingRules? = null

    @NotEmpty
    @Size(min = 1)
    @EmailList
    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "java.util.Collection")
        ]
    )
    var recipients: List<String> = emptyList()

    @ManyToOne()
    var deliveredItem: Asset? = null

    val deliveryType: String?
        @ComputedAttribute
        @Transient
        get() = this.deliveredItem?.assetType

    var version: String = "2.0"
}
