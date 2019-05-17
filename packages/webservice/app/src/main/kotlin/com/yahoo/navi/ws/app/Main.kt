/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app;
import com.yahoo.elide.standalone.ElideStandalone;

fun main(args: Array<String>) {
    val app = ElideStandalone(Settings())
    app.start()
}
