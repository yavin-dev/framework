/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.permissions.checks

import com.yahoo.elide.core.Path
import com.yahoo.elide.core.filter.FilterPredicate
import com.yahoo.elide.core.filter.Operator
import com.yahoo.elide.core.filter.expression.FilterExpression
import com.yahoo.elide.security.ChangeSpec
import com.yahoo.elide.security.FilterExpressionCheck
import com.yahoo.elide.security.RequestScope
import com.yahoo.elide.security.checks.CommitCheck
import com.yahoo.navi.ws.models.beans.HasAuthor
import com.yahoo.navi.ws.models.beans.User
import java.security.Principal
import java.util.Collections
import java.util.Optional
import kotlin.collections.Collection

object Author {

    /**
     * @param record user
     * @param requestScope Elide Resource
     * @param changeSpec Elide Resource
     * @return true if given record id matches user's id
     */
    private fun check(record: HasAuthor, requestScope: RequestScope): Boolean {
        val user = requestScope.user!!.opaqueUser as Principal
        val recordId = record.author!!.id
        val userId = user.name

        return recordId == userId
    }

    /**
     * Checks at the operation level
     */
    class AtOperation : FilterExpressionCheck<HasAuthor>() {
        /**
         * @param HasAuthor entityClass
         * @param RequestScope requestScope
         * @return
         */
        override fun getFilterExpression(entityClass: Class<*>?, requestScope: RequestScope): FilterExpression {
            val authorPath = Path.PathElement(entityClass, User::class.java, "author.id")

            val user = requestScope.user!!.opaqueUser as Principal

            return FilterPredicate(authorPath, Operator.IN, Collections.singletonList(user.name) as List<Any>)
        }
    }

    /**
     * Checks at the commit level
     */
    class AtCommitWithChangeSpec : CommitCheck<HasAuthor>() {

        /**
         * @param record user
         * @param requestScope Elide Resource
         * @param changeSpec Elide Resource
         * @return
         */
        override fun ok(record: HasAuthor, requestScope: RequestScope, changeSpec: Optional<ChangeSpec>): Boolean {
            if (!changeSpec.isPresent()) {
                return check(record, requestScope)
            }

            val original: Any? = changeSpec.get().original
            val modified: Any? = changeSpec.get().modified

            val user = requestScope.user!!.opaqueUser as Principal

            if (original is Collection<*> && modified is Collection<*> &&
                original.all { orig -> orig is HasAuthor } && modified.all { mod -> mod is HasAuthor }) {
                val records: List<HasAuthor> = modified.subtract(original).map { it -> it as HasAuthor }
                return records.all { it -> it.author!!.id == user.name }
            } else {
                val resource: Any? = changeSpec.get().resource?.`object`
                if (resource != null) {
                    return check(resource as HasAuthor, requestScope)
                }
            }
            return true
        }
    }
}