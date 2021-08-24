/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.models.checks

import com.yahoo.elide.core.security.User
import com.yahoo.elide.core.security.checks.UserCheck

open class DefaultJobRunnerCheck : UserCheck() {
    companion object {
        const val IS_JOB_RUNNER = "is a job runner"
    }
    override fun ok(user: User?): Boolean {
        return false; // no default logic
    }
}
