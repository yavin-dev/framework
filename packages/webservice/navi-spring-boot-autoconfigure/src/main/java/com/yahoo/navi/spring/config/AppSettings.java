/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.spring.config;

import lombok.Data;

@Data
public class AppSettings {
    private String factApiHost = "";

    private String persistenceApiHost = "/json";

    private String user = "";
}
