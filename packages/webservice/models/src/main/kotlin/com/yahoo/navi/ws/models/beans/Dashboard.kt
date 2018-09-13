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
import javax.persistence.Temporal
import javax.persistence.TemporalType
import javax.persistence.Transient
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.ManyToMany

@Entity
@Table(name="custom_dashboards")
@Include(rootLevel = true, type = "users")
@SharePermission(expression = "everybody")
@DeletePermission(expression = "is an author now")
@CreatePermission(expression = "is an author now OR is an editor now")
@UpdatePermission(expression = "is an author now")
class Dashboard : HasAuthor, HasEditors {
    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0

    var title: String? = null

    @get:JoinColumn(name = "author")
    @get:ManyToOne
    override var author: User? = null

    @get:ManyToMany(mappedBy = "editingDashboards")
    override var editors: Collection<User> = arrayListOf()

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

    /*@get:Column(name = "presentation", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.uad.ui.persistence.types.JsonType", parameters = {
        @Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.DashboardPresentation")
    })
    var presentation: DashboardPresentation*/

    /*@get:OneToMany(mappedBy = "dashboard", cascade = CascadeType.REMOVE, orphanRemoval = true)
    var widgets: Collection<DashboardWidget>*/
}