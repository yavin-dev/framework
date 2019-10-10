/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app
import com.yahoo.elide.standalone.ElideStandalone

fun main(args: Array<String>) {
    val settings = Settings()
    val app = ElideStandalone(settings)

    println("Webservice running on http://localhost:${settings.port}")
    app.start()
}
