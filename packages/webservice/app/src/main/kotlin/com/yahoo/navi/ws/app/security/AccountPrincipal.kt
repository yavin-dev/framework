package com.yahoo.navi.ws.app.security

import java.security.Principal
import javax.security.auth.Subject

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
class AccountPrincipal(val _name: String, val loggedIn: Boolean) : Principal {
    override fun getName(): String {
        return _name
    }

    override fun implies(subject: Subject?): Boolean {
        return false
    }
}