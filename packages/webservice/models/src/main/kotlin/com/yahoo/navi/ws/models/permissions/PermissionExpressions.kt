/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.permissions

import com.yahoo.elide.security.checks.Check
import com.yahoo.elide.security.checks.prefab.Role
import com.yahoo.navi.ws.models.permissions.checks.SameUser
import com.yahoo.navi.ws.models.permissions.checks.Author
import com.yahoo.navi.ws.models.permissions.checks.Editors

object PermissionExpressions {
    @JvmField
    var expressions: MutableMap<String, Class<out Check<out Any>>> = mutableMapOf(
        "is the same user" to SameUser.AtCommit::class.java,
        "is the same user now" to SameUser.AtOperation::class.java,
        "is an author" to Author.AtCommitWithChangeSpec::class.java,
        "is an author now" to Author.AtOperation::class.java,
        "is an editor" to Editors.AtCommit::class.java,
        "is an editor now" to Editors.AtOperation::class.java,
        "is author of dashboard" to Editors.canAddEditor::class.java,
        "everybody" to Role.ALL::class.java,
        "nobody" to Role.NONE::class.java
    )
}
