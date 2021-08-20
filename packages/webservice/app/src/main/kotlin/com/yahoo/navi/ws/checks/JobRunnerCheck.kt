/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.checks

import com.yahoo.elide.annotation.SecurityCheck
import com.yahoo.elide.core.security.User
import com.yahoo.navi.ws.models.checks.DefaultJobRunnerCheck

@SecurityCheck(DefaultJobRunnerCheck.IS_JOB_RUNNER)
class JobRunnerCheck : DefaultJobRunnerCheck() {
    override fun ok(user: User?): Boolean {
        return user?.isInRole("job-runner") == true
    }
}
