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
import com.yahoo.navi.ws.models.beans.User

open class DefaultSameUserCheck : FilterExpressionCheck<User>() {
    companion object {
        const val IS_SAME_USER = "is this same user"
    }
    override fun getFilterExpression(entityClass: Type<*>, requestScope: RequestScope): FilterPredicate {
        val userPath = Path.PathElement(getClassType(User::class.java), STRING_TYPE, "id")
        val path = Path(listOf(userPath))
        val value = listOf(requestScope.user.name)
        return FilterPredicate(path, Operator.IN, value)
    }
}
