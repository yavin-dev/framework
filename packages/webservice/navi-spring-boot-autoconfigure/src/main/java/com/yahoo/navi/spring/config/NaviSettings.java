/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.spring.config;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@JsonSerialize(as=NaviSettings.class)
@Configuration
@ConfigurationProperties(prefix = "navi")
public class NaviSettings {
    private AppSettings appSettings = new AppSettings();

    private NaviFeatureSettings FEATURES = new NaviFeatureSettings();
}
