package com.yahoo.yavin.ws.hooks

import com.yahoo.elide.annotation.LifeCycleHookBinding.Operation
import com.yahoo.elide.annotation.LifeCycleHookBinding.TransactionPhase
import com.yahoo.elide.core.lifecycle.LifeCycleHook
import com.yahoo.elide.core.security.ChangeSpec
import com.yahoo.elide.core.security.RequestScope
import com.yahoo.navi.ws.models.beans.DeliveryRule
import java.util.Optional

/**
 * A hook that will disable a delivery rule once the frequency (or "default") of maximumFailures is reached
 */
class DisableDeliveryRuleHook(private val maximumFailures: Map<String, Int>) : LifeCycleHook<DeliveryRule> {
    /**
     * Validates that if delivery is over alloted failures then it gets disabled
     */
    override fun execute(
        operation: Operation?,
        phase: TransactionPhase?,
        deliveryRule: DeliveryRule,
        requestScope: RequestScope?,
        changes: Optional<ChangeSpec>?
    ) {
        val maximumFailures = this.maximumFailures[deliveryRule.frequency] ?: this.maximumFailures["default"]
        val failCount = deliveryRule.failureCount ?: 0
        if (maximumFailures !== null && failCount > maximumFailures) {
            deliveryRule.disableRule()
        }
    }
}
