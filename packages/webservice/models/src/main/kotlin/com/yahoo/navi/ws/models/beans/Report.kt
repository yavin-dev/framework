/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans

import com.yahoo.elide.annotation.CreatePermission
import com.yahoo.elide.annotation.DeletePermission
import com.yahoo.elide.annotation.Include
import com.yahoo.elide.annotation.SharePermission
import com.yahoo.elide.annotation.UpdatePermission
import com.yahoo.navi.ws.models.beans.fragments.Request
import com.yahoo.navi.ws.models.beans.fragments.Visualization
import org.hibernate.annotations.Parameter
import org.hibernate.annotations.Type
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table

@Entity(name = "Report")
@Include(rootLevel = true, type = "reports")
@Table(name = "custom_reports")
@SharePermission
@CreatePermission(expression = "is an author")
@UpdatePermission(expression = "is an author now")
@DeletePermission(expression = "is an author now")
class Report : Asset(), HasAuthor {

    @get:JoinColumn(name = "author")
    @get:ManyToOne
    override var author: User? = null

    @get:Column(name = "request", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters =
        arrayOf(Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.Request")))
    var request: Request? = null

    @get:Column(name="visualization", columnDefinition = "MEDIUMTEXT")
    @get:Type(type = "com.yahoo.navi.ws.models.types.JsonType", parameters =
        arrayOf(Parameter(name = "class", value = "com.yahoo.navi.ws.models.beans.fragments.Visualization")))
    var visualization: Visualization? = null


}