package com.yahoo.yavin.ws.hooks

import com.yahoo.elide.annotation.LifeCycleHookBinding.Operation
import com.yahoo.elide.annotation.LifeCycleHookBinding.TransactionPhase
import com.yahoo.elide.core.lifecycle.LifeCycleHook
import com.yahoo.elide.core.security.ChangeSpec
import com.yahoo.elide.core.security.RequestScope
import com.yahoo.navi.ws.models.beans.DeliveryRule
import com.yahoo.navi.ws.models.config.DeliveryConfig
import java.util.Optional
import javax.inject.Inject

class DisableDeliveryRuleHook : LifeCycleHook<DeliveryRule> {
    @Inject
    lateinit var deliveryConfig: DeliveryConfig

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
        val maxFailures = deliveryConfig.maximumFailures[deliveryRule.frequency] ?: deliveryConfig.maximumFailures["default"] ?: 1
        val failCount = deliveryRule.failureCount ?: 0
        if (maxFailures <= failCount) {
            deliveryRule.disableRule()
        }
    }
}
