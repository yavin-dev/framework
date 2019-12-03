/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.spring.config;

import lombok.Data;

@Data
public class NaviFeatureSettings {
    private Boolean enableDashboardsFilters = true;
    private Boolean enableTableEditing = true;
    private Boolean enableTotals = true;
}
