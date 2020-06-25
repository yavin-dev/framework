/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.models.checks

import com.yahoo.elide.security.ChangeSpec
import com.yahoo.elide.security.RequestScope
import com.yahoo.elide.security.checks.OperationCheck
import com.yahoo.navi.ws.models.beans.HasEditors
import java.util.Optional

// TODO Convert to filter expression after this fix https://github.com/yahoo/elide/issues/683
// open class DefaultEditorsCheck : FilterExpressionCheck<HasEditors>() {
//     companion object {
//         const val IS_EDITOR = "is an Editor"
//     }
//     override fun getFilterExpression(entityClass: Class<*>, requestScope: RequestScope): FilterPredicate {
//         val hasAuthorPath = Path.PathElement(entityClass, User::class.java, "editors")
//         val userPath = Path.PathElement(User::class.java, String::class.java, "id")
//         val path = Path(listOf(hasAuthorPath, userPath))
//         val value = listOf(requestScope.user.name)
//         return FilterPredicate(path, Operator.IN, value)
//     }
// }

open class DefaultEditorsCheck : OperationCheck<HasEditors>() {
    companion object {
        const val IS_EDITOR = "is an Editor"
    }
    override fun ok(record: HasEditors, requestScope: RequestScope, changeSpec: Optional<ChangeSpec>): Boolean {
        val userId = requestScope.user.name
        return record.editors.any { editor -> editor.id == userId }
    }
}
