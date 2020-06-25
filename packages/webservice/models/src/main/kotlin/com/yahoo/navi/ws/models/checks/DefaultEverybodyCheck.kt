/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.checks

import com.yahoo.elide.security.checks.prefab.Role

open class DefaultEverybodyCheck : Role.ALL() {
    companion object {
        const val EVERYBODY = "everybody"
    }
}
