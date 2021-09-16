/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.models.hooks

import com.yahoo.elide.annotation.LifeCycleHookBinding
import com.yahoo.elide.core.lifecycle.LifeCycleHook
import com.yahoo.elide.core.security.ChangeSpec
import com.yahoo.elide.core.security.RequestScope
import com.yahoo.navi.ws.models.beans.Report
import java.util.Optional

/**
 * Cleans up references to a report so it can be safely deleted.
 */
class ReportDeletionHook : LifeCycleHook<Report> {
    override fun execute(
        operation: LifeCycleHookBinding.Operation,
        phase: LifeCycleHookBinding.TransactionPhase,
        report: Report,
        requestScope: RequestScope,
        changes: Optional<ChangeSpec>
    ) {
        val favoriteUsers = report.favoritedBy

        if (favoriteUsers != null) {
            for (user in favoriteUsers) {
                user.favoriteReports.remove(report)
            }
        }
    }
}
