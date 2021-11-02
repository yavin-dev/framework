/**
 * Copyright Yahoo 2021
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.interceptor

import org.springframework.http.CacheControl
import org.springframework.stereotype.Component
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.mvc.WebContentInterceptor
import java.util.concurrent.TimeUnit

@Component
class CacheInterceptor : WebMvcConfigurer {
    override fun addInterceptors(registry: InterceptorRegistry) {
        val interceptor = WebContentInterceptor()
        interceptor.addCacheMapping(CacheControl.maxAge(0, TimeUnit.SECONDS), "/ui/index.html", "/ui/assets/server-generated-config.js")
        interceptor.addCacheMapping(CacheControl.maxAge(1, TimeUnit.MINUTES).mustRevalidate(), "/ui/**")
        registry.addInterceptor(interceptor)
    }
}
