/**
 * Copyright 2022, Yahoo Holdings Inc.
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

    var dataSources: List<DataSource> = listOf(
        DataSource(
            "default",
            "Default",
            null,
            false,
            elideSettings.graphql.path,
            DataSourceTypes.elide,
            listOf(
                DataSourceNamespace(
                    "DemoNamespace",
                    "Demo Namespace",
                    null,
                    false,
                    listOf("DemoNamespace_TrendingNow")
                )
            ),
            listOf("NetflixTitles")
        )
    )

    var appPersistence = DataSource("persistence", "Persistence", null, false, elideSettings.jsonApi.path, DataSourceTypes.elide)

    @JsonProperty("FEATURES")
    var features = NaviFeatureSettings()
}
