/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.config

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.yahoo.elide.spring.config.ElideConfigProperties
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "navi")
@JsonSerialize(`as` = NaviConfig::class)
class NaviConfig @Autowired constructor(elideSettings: ElideConfigProperties) {
    var user = ""

    var dataSources: List<DataSource> = listOf(DataSource("default", elideSettings.graphql.path, DataSourceTypes.elide))

    var appPersistence = DataSource("persistence", elideSettings.jsonApi.path, DataSourceTypes.elide)

    @JsonProperty("FEATURES")
    var features = NaviFeatureSettings()
}
