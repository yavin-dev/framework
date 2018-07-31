package com.yahoo.navi.ws.app.filters

import javax.ws.rs.container.ContainerRequestContext
import javax.ws.rs.container.ContainerResponseContext
import javax.ws.rs.container.ContainerResponseFilter

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
class CorsFilter : ContainerResponseFilter {
    override fun filter(requestContext: ContainerRequestContext?, responseContext: ContainerResponseContext?) {
        requestContext?.let { req ->
            responseContext?.let { res ->
                val headers = res.headers
                val requestedHeaders = req.getHeaderString("Access-Control-Request-Headers")

                headers.putSingle("Vary", "Origin")
                headers.putSingle("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE")
                headers.putSingle("Access-Control-Allow-Headers", requestedHeaders ?: "")
                headers.putSingle("Access-Control-Allow-Origin", "*")
            }
        }
    }
}