/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.config

enum class DataSourceTypes {
    elide
}

data class DataSourceNamespace(
    var name: String,
    var displayName: String,
    var description: String? = null,
    var suggestedDataTables: List<String> = emptyList(),
)

data class DataSource(
    var name: String,
    var displayName: String,
    var description: String? = null,
    var uri: String,
    var type: DataSourceTypes,
    var namespaces: List<DataSourceNamespace> = emptyList(),
    var suggestedDataTables: List<String> = emptyList(),
    var timeout: Int = 900000,
)
