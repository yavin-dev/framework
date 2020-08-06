/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.models.hooks

import com.yahoo.elide.annotation.LifeCycleHookBinding
import com.yahoo.elide.core.exceptions.BadRequestException
import com.yahoo.elide.functions.LifeCycleHook
import com.yahoo.elide.security.ChangeSpec
import com.yahoo.elide.security.RequestScope
import com.yahoo.navi.ws.models.beans.User
import java.util.Optional

class UserValidationHook : LifeCycleHook<User> {
    override fun execute(operation: LifeCycleHookBinding.Operation?,
                         user: User?,
                         requestScope: RequestScope?,
                         changes: Optional<ChangeSpec>?) {
        val principalName = requestScope?.user?.name
        val userName = user?.id

        if (userName != principalName) {
            throw BadRequestException("Forbidden User Identity")
        }
    }
}