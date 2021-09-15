/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments.request

data class Rollup(
    var columnCids: List<String> = emptyList(), // cid list
    var grandTotal: Boolean = false
)
