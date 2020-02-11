/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.spring;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yahoo.navi.spring.config.NaviSettings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.context.annotation.Configuration;

import java.security.Principal;

@Configuration
@Controller
public class ClientSettings {
    private ObjectMapper mapper = new ObjectMapper();
    private NaviSettings settings;

    @Autowired
    public ClientSettings(NaviSettings settings) {
        this.settings = settings;
    }

    @GetMapping(value = "/assets/server-generated-config.js", produces = "application/javascript")
    public @ResponseBody String serverGeneratedConfig(Principal user) throws JsonProcessingException {
        settings.getAppSettings().setUser(user.getName());
        return "var NAVI_APP = " + mapper.writeValueAsString(settings) + ";";
    }
}