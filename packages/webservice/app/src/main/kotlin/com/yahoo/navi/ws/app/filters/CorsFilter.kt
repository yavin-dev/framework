/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app.filters

import javax.ws.rs.container.ContainerRequestContext
import javax.ws.rs.container.ContainerResponseContext
import javax.ws.rs.container.ContainerResponseFilter

class CorsFilter : ContainerResponseFilter {
    override fun filter(requestContext: ContainerRequestContext?, responseContext: ContainerResponseContext?) {
        requestContext?.let { req ->
            responseContext?.let { res ->
                val headers = res.headers
                val requestedHeaders = req.getHeaderString("Access-Control-Request-Headers")
                val origin = req.getHeaderString("Origin")

                headers.putSingle("Vary", "Origin")
                headers.putSingle("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PATCH,DELETE")
                headers.putSingle("Access-Control-Allow-Headers", requestedHeaders ?: "")
                headers.putSingle("Access-Control-Allow-Origin", origin ?: "*")
                headers.putSingle("Access-Control-Allow-Credentials", "true")
            }
        }
    }
}