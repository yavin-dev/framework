/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app.security

import java.security.Principal
import javax.security.auth.Subject

class AccountPrincipal(val _name: String, val loggedIn: Boolean) : Principal {
    override fun getName(): String {
        return _name
    }

    override fun implies(subject: Subject?): Boolean {
        return false
    }
}