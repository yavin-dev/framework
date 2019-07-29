/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments.layout

data class Layout(
    var column: Int,
    var row: Int,
    var height: Int,
    var width: Int,
    var widgetId: Int
) {
    constructor() : this(
            0, 0, 0, 0, 0
    )
}