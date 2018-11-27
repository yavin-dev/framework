/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app.filters

import com.yahoo.navi.ws.app.security.ApplicationSecurityContext
import javax.ws.rs.container.ContainerRequestContext
import javax.ws.rs.container.ContainerRequestFilter

class UserAuthFilter: ContainerRequestFilter {
    override fun filter(requestContext: ContainerRequestContext?) {
        requestContext?.let { ctx ->
            val user = ctx.getHeaderString("User") ?: ""
            val isSecure = ctx.securityContext.isSecure

            var loggedIn = false

            if(!user.isEmpty()) {
                loggedIn = true
            }

            ctx.securityContext = ApplicationSecurityContext(isSecure, loggedIn, user)
        }
    }
}