/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.permissions.checks

import com.yahoo.elide.security.ChangeSpec
import com.yahoo.elide.security.RequestScope
import com.yahoo.elide.security.checks.CommitCheck
import com.yahoo.elide.security.checks.OperationCheck
import com.yahoo.navi.ws.models.beans.HasAuthor
import com.yahoo.navi.ws.models.beans.HasEditors
import com.yahoo.navi.ws.models.beans.User
import java.security.Principal
import java.util.*

object Editors {

    /**
     * @param record user
     * @param requestScope Elide Resource
     * @return true if given record id matches user's id
     */
    private fun check(record: HasEditors, requestScope: RequestScope): Boolean {
        val user = requestScope.user!!.opaqueUser as Principal
        val userId = user.name

        return record.editors.any { editor -> editor.id == userId }
    }

    /**
     * Checks at the operation level
     */
    class AtOperation : OperationCheck<HasEditors>() {

        /**
         * @param HasAuthor entityClass
         * @param RequestScope requestScope
         * @return
         */
        override fun ok(record: HasEditors, requestScope: RequestScope, changeSpec: Optional<ChangeSpec>): Boolean {
            return check(record, requestScope)
        }
    }

    /**
     * Checks at the commit level
     */
    class AtCommit : CommitCheck<HasEditors>() {

        /**
         * @param record user
         * @param requestScope Elide Resource
         * @param changeSpec Elide Resource
         * @return
         */
        override fun ok(record: HasEditors, requestScope: RequestScope, changeSpec: Optional<ChangeSpec>): Boolean {
            return check(record, requestScope)
        }
    }

    /**
     * Checks that every record in changeset belongs to logged in user
     */
    class canAddEditor : CommitCheck<User>() {
        /**
         * @param record user
         * @param requestScope Elide Resource
         * @param changeSpec Elide Resource
         * @return
         */
        override fun ok(record: User, requestScope: RequestScope, changeSpec: Optional<ChangeSpec>): Boolean {
            val user = requestScope.user!!.opaqueUser as Principal
            val userId = user.name

            if (!changeSpec.isPresent) {
                val recordId = record.id
                return recordId == userId
            }

            val modified: Any? = changeSpec.get().modified
            val original: Any? = changeSpec.get().original

            if (modified is Collection<*> && original is Collection<*> &&
                    modified.all { it is HasAuthor } && original.all { it is HasAuthor }) {
                val records: List<HasAuthor> = modified.subtract(original).map { it as HasAuthor }
                return records.all { asset -> asset.author!!.id == userId }
            }
            return false
        }
    }
}