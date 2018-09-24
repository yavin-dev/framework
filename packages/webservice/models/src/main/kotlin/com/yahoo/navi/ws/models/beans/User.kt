package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.SharePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.elide.annotation.ReadPermission
import com.yahoo.elide.annotation.ComputedAttribute
import com.yahoo.navi.ws.models.utils.FormatDate

import org.hibernate.annotations.Generated
import org.hibernate.annotations.GenerationTime
import java.util.Date

import javax.persistence.Entity
import javax.persistence.Table
import javax.persistence.Id
import javax.persistence.Column
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany
import javax.persistence.OneToMany
import javax.persistence.Temporal
import javax.persistence.TemporalType
import javax.persistence.Transient

@Entity
@Table(name="navi_users")
@Include(rootLevel = true, type = "users")
@SharePermission
@DeletePermission(expression = "nobody")
@CreatePermission(expression = "is the same user")
@UpdatePermission(expression = "is the same user now")
class User {
    @get:Id
    var id: String? = null

    @get:Generated(GenerationTime.INSERT)
    @get:Column(updatable = false, insertable = false, columnDefinition = "timestamp default current_timestamp")
    @get:Temporal(TemporalType.TIMESTAMP)
    @get:ReadPermission(expression = "nobody")
    @get:UpdatePermission(expression = "nobody")
    var createDate: Date? = null

    var createdOn: String? = null
        @Transient
        @ComputedAttribute
        get() = FormatDate.format(createDate)

    @get:OneToMany(mappedBy = "author")
    var reports: Collection<Report> = arrayListOf()

    @get:ManyToMany
    @get:JoinTable(
        name = "map_user_to_fav_reports",
        joinColumns = arrayOf(JoinColumn( name = "user_id", referencedColumnName = "id")),
        inverseJoinColumns = arrayOf(JoinColumn( name = "report_id", referencedColumnName = "id"))
    )
    var favoriteReports: Collection<Report> = arrayListOf()

    @get:OneToMany(mappedBy = "author")
    var dashboards: Collection<Dashboard> = arrayListOf()

    @get:UpdatePermission(expression = "is an author")
    @get:ManyToMany
    @get:JoinTable(
        name = "map_editor_to_dashboard_collections",
        joinColumns=arrayOf(JoinColumn(name = "user_id", referencedColumnName = "id")),
        inverseJoinColumns = arrayOf(JoinColumn(name = "dashboard_collection_id", referencedColumnName = "id")))
    var editingDashboards: Collection<Dashboard> = arrayListOf()

    @get:ManyToMany
    @JoinTable(
        name = "map_user_to_fav_dashboards",
        joinColumns = arrayOf(JoinColumn( name = "user_id", referencedColumnName = "id")),
        inverseJoinColumns = arrayOf(JoinColumn(name = "dashboard_id", referencedColumnName = "id"))
    )
    var favoriteDashboards: Collection<Dashboard> = arrayListOf()
}