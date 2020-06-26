/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments.layout

data class Layout(
    var column: Int = 0,
    var row: Int = 0,
    var height: Int = 0,
    var width: Int = 0,
    var widgetId: Int = 0
)
