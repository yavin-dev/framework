/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.config

enum class DataSourceTypes {
    elide
}

data class DataSource(
    var name: String,
    var displayName: String,
    var description: String? = null,
    var uri: String,
    var type: DataSourceTypes,
    var timeout: Int = 900000,
    var suggestedDataTables: List<String> = emptyList(),
)
