/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.checks

import com.yahoo.elide.core.security.ChangeSpec
import com.yahoo.elide.core.security.RequestScope
import com.yahoo.elide.core.security.checks.OperationCheck
import com.yahoo.navi.ws.models.beans.HasAuthor
import com.yahoo.navi.ws.models.beans.User
import java.util.Optional

open class DefaultDashboardAuthorCheck : OperationCheck<User>() {
    companion object {
        const val IS_DASHBOARD_AUTHOR = "is dashboard author"
    }

    override fun ok(record: User, requestScope: RequestScope, changeSpec: Optional<ChangeSpec>): Boolean {
        val userId = requestScope.user.name

        if (!changeSpec.isPresent) {
            val recordId = record.id
            return recordId == userId
        }

        val modified: Any? = changeSpec.get().modified
        val original: Any? = changeSpec.get().original

        if (modified is Collection<*> && original is Collection<*> &&
            modified.all { it is HasAuthor } && original.all { it is HasAuthor }
        ) {
            val records: List<HasAuthor> = modified.subtract(original).map { it as HasAuthor }
            return records.all { asset -> asset.author!!.id == userId }
        }
        return false
    }
}
