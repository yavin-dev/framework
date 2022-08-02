package com.yahoo.yavin.ws.hooks

import com.yahoo.elide.annotation.LifeCycleHookBinding.Operation
import com.yahoo.elide.annotation.LifeCycleHookBinding.TransactionPhase
import com.yahoo.elide.core.lifecycle.LifeCycleHook
import com.yahoo.elide.core.security.ChangeSpec
import com.yahoo.elide.core.security.RequestScope
import com.yahoo.navi.ws.models.beans.DeliveryRule
import com.yahoo.navi.ws.models.beans.enums.DeliveryFrequency
import java.util.Optional

class DisableDeliveryRuleHook : LifeCycleHook<DeliveryRule> {
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
        if (
            (((deliveryRule.failureCount!! >= 6) && (deliveryRule.frequency == DeliveryFrequency.week)) || (deliveryRule.frequency == DeliveryFrequency.quarter)) ||
            (deliveryRule.failureCount!! >= 9)
        ) {
            deliveryRule.disableRule()
        }
    }
}
