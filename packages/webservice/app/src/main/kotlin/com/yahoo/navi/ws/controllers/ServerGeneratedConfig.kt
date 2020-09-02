/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.controllers

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.ObjectMapper
import com.yahoo.elide.spring.config.ElideConfigProperties
import com.yahoo.navi.ws.config.NaviConfig
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ResponseBody
import java.security.Principal

@Configuration
@Controller
class ServerGeneratedConfig @Autowired constructor(naviSettings: NaviConfig, elideSettings: ElideConfigProperties) {
    private val mapper = ObjectMapper()
    private val naviSettings: NaviConfig
    private val elideSettings: ElideConfigProperties

    @GetMapping(value = ["/assets/server-generated-config.js"], produces = ["application/javascript"])
    @ResponseBody
    @Throws(JsonProcessingException::class)
    fun serverGeneratedConfig(user: Principal): String {
        naviSettings.appSettings.user = user.name ?: ""

        if (naviSettings.appSettings.persistenceApiHost == "") {
            naviSettings.appSettings.persistenceApiHost = elideSettings.jsonApi.path
        }
        return "var NAVI_APP = " + mapper.writeValueAsString(naviSettings) + ";"
    }

    init {
        this.naviSettings = naviSettings
        this.elideSettings = elideSettings
    }
}
