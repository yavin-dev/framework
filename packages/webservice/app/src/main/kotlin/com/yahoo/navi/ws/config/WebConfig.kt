/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Configures the web container.
 */
@Configuration
class WebConfig : WebMvcConfigurer {
    override fun addViewControllers(registry: ViewControllerRegistry) {
        registry.addViewController("/ui/").setViewName("forward:/ui/index.html")
        registry.addViewController("/ui/**/{path:[^\\.]*}").setViewName("forward:/ui/")
        registry.addViewController("/ui").setViewName("redirect:/ui/")
        registry.addViewController("/").setViewName("redirect:/ui/")
    }
}
