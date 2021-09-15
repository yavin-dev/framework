/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.models.hooks

import com.yahoo.elide.annotation.LifeCycleHookBinding
import com.yahoo.elide.core.dictionary.EntityDictionary
import com.yahoo.elide.core.exceptions.BadRequestException
import com.yahoo.elide.core.lifecycle.LifeCycleHook
import com.yahoo.elide.core.security.ChangeSpec
import com.yahoo.elide.core.security.RequestScope
import com.yahoo.navi.ws.models.beans.User
import com.yahoo.navi.ws.models.checks.DefaultAdminCheck
import com.yahoo.navi.ws.models.checks.DefaultAdminCheck.Companion.IS_ADMIN
import java.util.Optional
import javax.inject.Inject

/**
 * Validates a User model on creation.  Elide 5 does not support CreatePermission checks
 * on ID fields - and so this logic is implemented as a hook.  Longer term, Navi should
 * not overload the ID field - it should be a simple surrogate key.
 */
class UserValidationHook() : LifeCycleHook<User> {
    @Inject
    private lateinit var dictionary: EntityDictionary

    /**
     * Validates that the current requesting user is an admin or the same user that is being created
     */
    override fun execute(operation: LifeCycleHookBinding.Operation, phase: LifeCycleHookBinding.TransactionPhase, user: User, requestScope: RequestScope, changes: Optional<ChangeSpec>) {
        val adminCheck = dictionary.injector.instantiate(dictionary.getCheck(IS_ADMIN)) as DefaultAdminCheck?
        val isRequestingUserAdmin = adminCheck?.ok(requestScope.user) ?: false

        val principalName = requestScope.user?.name
        val userName = user.id

        if (principalName.isNullOrEmpty() || userName != principalName && !isRequestingUserAdmin) {
            throw BadRequestException("Forbidden User Identity")
        }
    }
}
