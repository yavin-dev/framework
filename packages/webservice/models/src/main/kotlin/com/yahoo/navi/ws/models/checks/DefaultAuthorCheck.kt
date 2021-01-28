/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.checks

import com.yahoo.elide.core.Path
import com.yahoo.elide.core.filter.Operator
import com.yahoo.elide.core.filter.predicates.FilterPredicate
import com.yahoo.elide.core.security.RequestScope
import com.yahoo.elide.core.security.checks.FilterExpressionCheck
import com.yahoo.elide.core.type.ClassType.STRING_TYPE
import com.yahoo.elide.core.type.Type
import com.yahoo.elide.core.utils.TypeHelper.getClassType
import com.yahoo.navi.ws.models.beans.HasAuthor
import com.yahoo.navi.ws.models.beans.User

open class DefaultAuthorCheck : FilterExpressionCheck<HasAuthor>() {
    companion object {
        const val IS_AUTHOR = "is author"
    }
    override fun getFilterExpression(entityClass: Type<*>, requestScope: RequestScope): FilterPredicate {
        val userClassType = getClassType(User::class.java)
        val hasAuthorPath = Path.PathElement(entityClass, userClassType, "author")
        val userPath = Path.PathElement(userClassType, STRING_TYPE, "id")
        val path = Path(listOf(hasAuthorPath, userPath))
        val value = listOf(requestScope.user.name)
        return FilterPredicate(path, Operator.IN, value)
    }
}
