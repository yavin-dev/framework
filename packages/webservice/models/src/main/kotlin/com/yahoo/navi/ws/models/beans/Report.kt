/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.Exclude
import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.LifeCycleHookBinding
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.navi.ws.models.beans.fragments.Request
import com.yahoo.navi.ws.models.beans.fragments.Visualization
import com.yahoo.navi.ws.models.checks.DefaultAdminCheck.Companion.IS_ADMIN
import com.yahoo.navi.ws.models.checks.DefaultOwnerCheck.Companion.IS_OWNER
import com.yahoo.navi.ws.models.hooks.ReportDeletionHook
import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.DiscriminatorValue
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.ManyToMany
import javax.persistence.OneToMany

@Entity
@DiscriminatorValue("report")
@Include(name = "reports")
@CreatePermission(expression = "$IS_OWNER OR $IS_ADMIN")
@UpdatePermission(expression = "$IS_OWNER OR $IS_ADMIN")
@DeletePermission(expression = "$IS_OWNER OR $IS_ADMIN")
@LifeCycleHookBinding(
    phase = LifeCycleHookBinding.TransactionPhase.PREFLUSH,
    operation = LifeCycleHookBinding.Operation.DELETE,
    hook = ReportDeletionHook::class
)
class Report : Asset(), HasOwner {

    @Column(name = "request", columnDefinition = "MEDIUMTEXT")
    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.Request")
        ]
    )
    var request: Request? = null

    @Column(name = "visualization", columnDefinition = "MEDIUMTEXT")
    @Type(
        type = "com.yahoo.navi.ws.models.types.JsonType",
        parameters = [
            Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.Visualization")
        ]
    )
    var visualization: Visualization? = null

    @OneToMany(mappedBy = "deliveredItem", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    var deliveryRules: MutableSet<DeliveryRule>? = null

    @Exclude
    @ManyToMany(mappedBy = "favoriteReports", fetch = FetchType.LAZY)
    var favoritedBy: MutableSet<User>? = null
}
