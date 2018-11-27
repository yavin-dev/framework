/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app.security

import java.security.Principal
import javax.ws.rs.core.SecurityContext

class ApplicationSecurityContext(val _isSecure : Boolean, isLoggedIn: Boolean, userName: String) : SecurityContext {
    val principal : AccountPrincipal = AccountPrincipal(userName, isLoggedIn)

    override fun isUserInRole(role: String?) : Boolean {
        return false
    }

    override fun getAuthenticationScheme(): String {
        return "custom"
    }

    override fun getUserPrincipal(): Principal {
        return principal
    }

    override fun isSecure(): Boolean {
        return _isSecure
    }
}