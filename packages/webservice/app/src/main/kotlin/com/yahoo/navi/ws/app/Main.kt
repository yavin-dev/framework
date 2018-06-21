package com.yahoo.navi.ws.app;

import com.yahoo.elide.standalone.ElideStandalone;

fun main(args: Array<String>) {
    val app = ElideStandalone(Settings());
    app.start();
}
