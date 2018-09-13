package com.yahoo.navi.ws.models.permissions.checks

import com.yahoo.elide.security.ChangeSpec
import com.yahoo.elide.security.RequestScope
import com.yahoo.elide.security.checks.CommitCheck
import com.yahoo.elide.security.checks.OperationCheck
import com.yahoo.navi.ws.models.beans.HasEditors
import java.security.Principal
import java.util.Optional
import kotlin.collections.Collection

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
object Editors {

    /**
     * @param record user
     * @param requestScope Elide Resource
     * @return true if given record id matches user's id
     */
    private fun check(record: HasEditors, requestScope: RequestScope): Boolean {
        val user = requestScope.user!!.opaqueUser as Principal
        val userId = user.name

        return record.editors.any{ editor -> editor!!.id == userId }
    }

    /**
     * Checks at the operation level
     */
    class AtOperation : OperationCheck<HasEditors>() {

        /**
         * @param record HasEditors
         * @param requestScope Elide Resource
         * @param changeSpec Elide Resource
         * @return true if given record id matches user's id
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
}