/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.apache.http.HttpStatus
import org.junit.Test
import org.hamcrest.Matchers.*
import com.jayway.restassured.RestAssured.given

class RoleTest : IntegrationTest() {
    private val naviUser1 = "user1"
    private val adminRole = "admin"
    private val userRole = "user"

    @Test
    fun roleEndpointTest() {
        /*
         * Role endpoint is initially empty
         */
        given()
            .cookie("User", naviUser1)
        .When()
            .get("roles")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_OK)
            .body("data", empty<Any>())
    }
}
