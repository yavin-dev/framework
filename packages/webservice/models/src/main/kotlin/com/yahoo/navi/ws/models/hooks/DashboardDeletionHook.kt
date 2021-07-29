/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.models.hooks

import com.yahoo.elide.annotation.LifeCycleHookBinding
import com.yahoo.elide.core.lifecycle.LifeCycleHook
import com.yahoo.elide.core.security.ChangeSpec
import com.yahoo.elide.core.security.RequestScope
import com.yahoo.navi.ws.models.beans.Dashboard
import java.util.Optional

/**
 * Cleans up references to a dashboard so it can be safely deleted.
 */
class DashboardDeletionHook : LifeCycleHook<Dashboard> {
    override fun execute(
        operation: LifeCycleHookBinding.Operation?,
        phase: LifeCycleHookBinding.TransactionPhase?,
        dashboard: Dashboard?,
        requestScope: RequestScope?,
        changes: Optional<ChangeSpec>?
    ) {
        var favoriteUsers = dashboard?.favoritedBy

        if (favoriteUsers != null) {
            for (user in favoriteUsers) {
                user?.favoriteDashboards?.remove(dashboard)
            }
        }
    }
}
