package com.yahoo.yavin.ws.hooks

import com.yahoo.elide.annotation.LifeCycleHookBinding.Operation
import com.yahoo.elide.annotation.LifeCycleHookBinding.TransactionPhase
import com.yahoo.elide.core.exceptions.InvalidValueException
import com.yahoo.elide.core.lifecycle.LifeCycleHook
import com.yahoo.elide.core.security.ChangeSpec
import com.yahoo.elide.core.security.RequestScope
import com.yahoo.navi.ws.models.beans.DeliveryRule
import com.yahoo.navi.ws.models.beans.enums.Delivery
import java.util.Optional

class DeliveryRuleConditionalRecipientsHook : LifeCycleHook<DeliveryRule> {
    /**
     * Validates that if delivery is not none recipients is not empty
     */
    override fun execute(
        operation: Operation?,
        phase: TransactionPhase?,
        deliveryRule: DeliveryRule,
        requestScope: RequestScope?,
        changes: Optional<ChangeSpec>?
    ) {
        if (deliveryRule.recipients.isNullOrEmpty() && (deliveryRule.delivery !== Delivery.none)) {
            throw InvalidValueException("If Delivery is not none, then at least one recipient is required")
        }
    }
}
