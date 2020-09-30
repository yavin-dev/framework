/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.checks

import com.yahoo.elide.core.Path
import com.yahoo.elide.core.filter.FilterPredicate
import com.yahoo.elide.core.filter.Operator
import com.yahoo.elide.security.RequestScope
import com.yahoo.elide.security.checks.FilterExpressionCheck
import com.yahoo.navi.ws.models.beans.HasAuthor
import com.yahoo.navi.ws.models.beans.User

open class DefaultAuthorCheck : FilterExpressionCheck<HasAuthor>() {
    companion object {
        const val IS_AUTHOR = "is author"
    }
    override fun getFilterExpression(entityClass: Class<*>, requestScope: RequestScope): FilterPredicate {
        val hasAuthorPath = Path.PathElement(entityClass, User::class.java, "author")
        val userPath = Path.PathElement(User::class.java, String::class.java, "id")
        val path = Path(listOf(hasAuthorPath, userPath))
        val value = listOf(requestScope.user.name)
        return FilterPredicate(path, Operator.IN, value)
    }
}
