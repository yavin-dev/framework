/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.UpdatePermission
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.util.Date
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

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
abstract class Asset: HasAuthor {
    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0

    open var title: String? = null

    @get:JoinColumn(name = "author")
    @get:ManyToOne
    override var author: User? = null

    @get:CreationTimestamp
    @get:Column(columnDefinition = "timestamp default current_timestamp")
    @get:Temporal(TemporalType.TIMESTAMP)
    @get:UpdatePermission(expression = "nobody")
    open var createdOn: Date? = null

    @get:UpdateTimestamp
    @get:Column(columnDefinition = "timestamp default current_timestamp")
    @get:Temporal(TemporalType.TIMESTAMP)
    @get:UpdatePermission(expression = "nobody")
    open var updatedOn: Date? = null
}