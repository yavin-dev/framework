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
import com.yahoo.elide.annotation.LifeCycleHookBinding
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.navi.ws.models.beans.enums.Delivery
import com.yahoo.navi.ws.models.beans.enums.DeliveryFrequency
import com.yahoo.navi.ws.models.beans.fragments.DeliveryFormat
import com.yahoo.navi.ws.models.beans.fragments.SchedulingRules
import com.yahoo.navi.ws.models.checks.DefaultAdminCheck
import com.yahoo.navi.ws.models.checks.DefaultAdminCheck.Companion.IS_ADMIN
import com.yahoo.navi.ws.models.checks.DefaultJobRunnerCheck
import com.yahoo.navi.ws.models.checks.DefaultNobodyCheck
import com.yahoo.navi.ws.models.checks.DefaultOwnerCheck.Companion.IS_OWNER
import com.yahoo.yavin.ws.hooks.VerifyDeliveryRuleRecipientsHook
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
import javax.validation.constraints.NotNull

@Entity
@Include(name = "deliveryRules")
@DiscriminatorValue("deliveryRule")
@CreatePermission(expression = "$IS_OWNER OR $IS_ADMIN")
@UpdatePermission(expression = "$IS_OWNER OR $IS_ADMIN")
@DeletePermission(expression = "$IS_OWNER OR $IS_ADMIN")
@LifeCycleHookBinding(
    operation = LifeCycleHookBinding.Operation.CREATE,
    hook = VerifyDeliveryRuleRecipientsHook::class
)
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
    @UpdatePermission(expression = "${DefaultJobRunnerCheck.IS_JOB_RUNNER} OR ${DefaultAdminCheck.IS_ADMIN}")
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

    @NotNull
    var delivery: Delivery? = null

    @NotNull
    var isDisabled: Boolean? = null

    @Column(name = "scheduling_rules", columnDefinition = "MEDIUMTEXT")
    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.SchedulingRules")
        ]
    )
    var schedulingRules: SchedulingRules? = null

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

    val dataSources: Set<String>
        @ComputedAttribute
        @Transient
        get() {
            val item = this.deliveredItem ?: return emptySet()
            val requests = when (item) {
                is Report -> arrayListOf(item.request)
                is Dashboard -> item.widgets.flatMap { widget -> widget.requests }
                else -> emptyList()
            }
            return requests.mapNotNull { request -> request?.dataSource }.toSet()
        }

    val deliveryType: String?
        @ComputedAttribute
        @Transient
        get() = this.deliveredItem?.assetType

    var version: String = "2.0"
}
