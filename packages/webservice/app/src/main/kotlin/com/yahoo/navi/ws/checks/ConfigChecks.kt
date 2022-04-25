/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.checks

import com.yahoo.elide.annotation.SecurityCheck
import com.yahoo.elide.core.security.checks.prefab.Role
import com.yahoo.elide.modelconfig.store.models.ConfigChecks.CAN_CREATE_CONFIG
import com.yahoo.elide.modelconfig.store.models.ConfigChecks.CAN_DELETE_CONFIG
import com.yahoo.elide.modelconfig.store.models.ConfigChecks.CAN_READ_CONFIG
import com.yahoo.elide.modelconfig.store.models.ConfigChecks.CAN_UPDATE_CONFIG

@SecurityCheck(CAN_CREATE_CONFIG)
class CanCreate : Role.ALL()

@SecurityCheck(CAN_READ_CONFIG)
class CanRead : Role.ALL()

@SecurityCheck(CAN_UPDATE_CONFIG)
class CanUpdate : Role.ALL()

@SecurityCheck(CAN_DELETE_CONFIG)
class CanDelete : Role.ALL()
