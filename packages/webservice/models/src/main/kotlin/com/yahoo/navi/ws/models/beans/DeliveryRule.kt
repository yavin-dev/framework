package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.navi.ws.models.utils.singularize
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.persistence.OneToOne
import javax.persistence.PrimaryKeyJoinColumn
import javax.persistence.Table

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
@Entity
@Include(rootLevel = true, type = "deliveryRules")
@Table(name = "delivery_rules")
class DeliveryRule {
    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null

    @get:UpdatePermission(expression = "nobody")
    var deliveredType: String? = null

    @get:ManyToOne
    var deliveredItem: Asset? = null
        set(value) {
            field = value
            this.deliveredType = singularize(value!!::class.java.getAnnotation(Include::class.java).type)
        }
}