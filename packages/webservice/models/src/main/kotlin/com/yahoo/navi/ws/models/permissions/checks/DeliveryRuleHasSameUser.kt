package com.yahoo.navi.ws.models.permissions.checks

import com.yahoo.elide.security.ChangeSpec
import com.yahoo.elide.security.RequestScope
import com.yahoo.elide.security.checks.CommitCheck
import com.yahoo.elide.security.checks.OperationCheck
import com.yahoo.navi.ws.models.beans.DeliveryRule
import java.security.Principal
import java.util.Optional

/**
 * Copyright (c) 2018, Yahoo Inc.
 */
object DeliveryRuleHasSameUser {
    /**
     * @param record DeliveryRule
     * @param requestScope Elide Resource
     * @return true if given record author matches user's id
     */
    private fun check(record: DeliveryRule, requestScope: RequestScope): Boolean {
        val user = requestScope.user!!.opaqueUser as Principal
        val recordId = record.owner!!.id
        val userId = user.name

        return recordId == userId
    }

    /**
     * Checks at the operation level
     */
    class AtOperation : OperationCheck<DeliveryRule>() {

        /**
         * @param record DeliveryRule
         * @param requestScope Elide Resource
         * @param changeSpec Elide Resource
         * @return true if given record id matches user's id
         */
        override fun ok(record: DeliveryRule, requestScope: RequestScope, changeSpec: Optional<ChangeSpec>): Boolean {
            return check(record, requestScope)
        }
    }

    /**
     * Checks at the commit level
     */
    class AtCommit : CommitCheck<DeliveryRule>() {

        /**
         * @param record DeliveryRule
         * @param requestScope Elide Resource
         * @param changeSpec Elide Resource
         * @return
         */
        override fun ok(record: DeliveryRule, requestScope: RequestScope, changeSpec: Optional<ChangeSpec>): Boolean {
            return check(record, requestScope)
        }
    }
}