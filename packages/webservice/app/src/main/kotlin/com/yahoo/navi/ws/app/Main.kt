/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app
import com.yahoo.elide.standalone.ElideStandalone

fun main(args: Array<String>) {
    val settings = Settings()
    val app = ElideStandalone(settings)

    println("Webservice up: http://localhost:${settings.port}/api/v1")
    println("Swagger json:  http://localhost:${settings.port}/swagger/doc/api")
    println("Swagger ui:    http://localhost:${settings.port}/swagger-ui/")
    app.start()
}
