package com.yahoo.navi.ws.test.unit

import com.yahoo.navi.ws.models.beans.User
import com.yahoo.navi.ws.models.permissions.checks.SameUser

import com.yahoo.elide.security.ChangeSpec
import com.yahoo.elide.security.RequestScope
import org.eclipse.jetty.security.MappedLoginService
import org.junit.Assert
import org.junit.Test
import org.mockito.Mockito

import java.util.Optional

/**
 * Test cases for user security check
 */
class SameUserTest {

    @Test
    fun checkTest() {

        val matchingUserId = "test user"

        // Mock a request user
        val requestUser = Mockito.mock(MappedLoginService.UserPrincipal::class.java)
        Mockito.`when`(requestUser.getName()).thenReturn(matchingUserId)

        // Mock an Elide resource
        val elideUser = Mockito.mock(com.yahoo.elide.security.User::class.java)
        val requestScope = Mockito.mock(RequestScope::class.java)
        Mockito.`when`(requestScope.getUser()).thenReturn(elideUser)
        Mockito.`when`(requestScope.getUser().getOpaqueUser()).thenReturn(requestUser)

        val user = User()
        user.id = matchingUserId

        val changeSpec = Optional.empty<ChangeSpec>()

        val securityCheckAtCommit = SameUser.AtCommit()
        val securityCheckAtOperation = SameUser.AtOperation()

        // Test the security check
        Assert.assertTrue(
                "Check is successful when user id and request id match",
                securityCheckAtCommit.ok(user, requestScope, changeSpec)
        )
        Assert.assertTrue(
                "Check is successful when user id and request id match",
                securityCheckAtOperation.ok(user, requestScope, changeSpec)
        )

        user.id = "some other user"
        Assert.assertFalse(
                "Check fails when user id is different from bouncer id",
                securityCheckAtCommit.ok(user, requestScope, changeSpec)
        )
        Assert.assertFalse(
                "Check fails when user id is different from bouncer id",
                securityCheckAtOperation.ok(user, requestScope, changeSpec)
        )
    }
}