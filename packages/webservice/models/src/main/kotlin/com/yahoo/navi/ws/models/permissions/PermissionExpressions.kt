/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.permissions

import com.yahoo.elide.security.checks.Check
import com.yahoo.elide.security.checks.prefab.Role

object PermissionExpressions {
    var expressions: MutableMap<String, Class<out Check<out Any>>> = mutableMapOf(
        "everybody" to Role.ALL::class.java,
        "nobody" to Role.NONE::class.java
    )
}