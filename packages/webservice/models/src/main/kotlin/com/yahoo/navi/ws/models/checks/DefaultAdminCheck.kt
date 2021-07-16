/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.models.checks

import com.yahoo.elide.core.security.User
import com.yahoo.elide.core.security.checks.UserCheck

open class DefaultAdminCheck : UserCheck() {
    companion object {
        const val IS_ADMIN = "is an admin"
    }
    override fun ok(user: User?): Boolean {
        return user?.isInRole("admin") == true
    }
}
