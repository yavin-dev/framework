/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.SharePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.UpdatePermission
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.Where

import java.util.Date

import javax.persistence.Entity
import javax.persistence.Table
import javax.persistence.Id
import javax.persistence.Column
import javax.persistence.JoinTable
import javax.persistence.JoinColumn
import javax.persistence.Temporal
import javax.persistence.TemporalType
import javax.persistence.OneToMany
import javax.persistence.ManyToMany
import javax.validation.constraints.NotBlank

@Entity
@Table(name = "navi_users")
@Include(rootLevel = true, type = "users")
@SharePermission
@DeletePermission(expression = "nobody")
@CreatePermission(expression = "is the same user")
@UpdatePermission(expression = "is the same user now")
class User : HasRoles {
    @get:Id
    @get:NotBlank
    var id: String? = null

    @get:CreationTimestamp
    @get:Column(columnDefinition = "timestamp default current_timestamp")
    @get:Temporal(TemporalType.TIMESTAMP)
    @get:UpdatePermission(expression = "nobody")
    var createdOn: Date? = null

    @get:CreationTimestamp
    @get:Column(columnDefinition = "timestamp default current_timestamp")
    @get:Temporal(TemporalType.TIMESTAMP)
    @get:UpdatePermission(expression = "nobody")
    var updatedOn: Date? = null

    @get:OneToMany(mappedBy = "author", targetEntity = Asset::class)
    @get:Where(clause = "ASSET_TYPE = 'Report'")
    var reports: Collection<Report> = arrayListOf()

    @get:ManyToMany
    @get:JoinTable(
            name = "map_user_to_fav_reports",
            joinColumns = arrayOf(JoinColumn(name = "user_id", referencedColumnName = "id")),
            inverseJoinColumns = arrayOf(JoinColumn(name = "report_id", referencedColumnName = "id"))
    )
    var favoriteReports: Collection<Report> = arrayListOf()

    @get:OneToMany(mappedBy = "author", targetEntity = Asset::class)
    @get:Where(clause = "ASSET_TYPE = 'Dashboard'")
    var dashboards: Collection<Dashboard> = arrayListOf()

    @get:UpdatePermission(expression = "is author of dashboard")
    @get:ManyToMany
    @get:JoinTable(
            name = "map_editor_to_dashboard_collections",
            joinColumns = arrayOf(JoinColumn(name = "user_id", referencedColumnName = "id")),
            inverseJoinColumns = arrayOf(JoinColumn(name = "dashboard_collection_id", referencedColumnName = "id")))
    var editingDashboards: Collection<Dashboard> = arrayListOf()

    @get:ManyToMany
    @get:JoinTable(
            name = "map_user_to_fav_dashboards",
            joinColumns = arrayOf(JoinColumn(name = "user_id", referencedColumnName = "id")),
            inverseJoinColumns = arrayOf(JoinColumn(name = "dashboard_id", referencedColumnName = "id"))
    )
    var favoriteDashboards: Collection<Dashboard> = arrayListOf()

    @get:OneToMany(mappedBy = "id", targetEntity = Role::class)
    override var roles: Collection<Role> = arrayListOf()
}
