/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.config

import com.fasterxml.jackson.databind.annotation.JsonSerialize
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "navi")
@JsonSerialize(`as` = NaviConfig::class)
class NaviConfig {
    val appSettings = AppSettings()
    val FEATURES = NaviFeatureSettings()
}
