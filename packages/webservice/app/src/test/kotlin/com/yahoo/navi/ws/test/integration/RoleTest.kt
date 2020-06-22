/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.yahoo.navi.ws.test.framework.IntegrationTest
import com.yahoo.navi.ws.test.framework.matchers.RegexMatcher
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

        /*
         * New role can be added
         */
        registerRole(adminRole, naviUser1)

        /*
         * Created role is visible in roles endpoint
         */
        given()
            .cookie("User", naviUser1)
        .When()
            .get("/roles")
        .then()
            .assertThat()
            .body("data.id", hasItems<String>(adminRole))
    }

    @Test
    fun createDateTest() {
        /*
         * Add test role
         */
        registerRole(userRole, naviUser1)

        /*
         * Check for created date
         */
        given()
            .cookie("User", naviUser1)
        .When()
            .get("/roles/$userRole")
        .then()
            .assertThat()
            .body("data.attributes.createDate", nullValue())
            .body("data.attributes.createdOn",
                RegexMatcher.matchesRegex("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}")) // YYYY-MM-DD HH:MM:ss

        given()
            .cookie("User", naviUser1)
            .contentType("application/vnd.api+json")
            .body(
                    """
                {
                    "data": {
                        "type": "roles",
                        "id": "$userRole",
                        "attributes": {
                            "createdOn": "2015-12-10 10:56:23"
                        }
                    }
                }
                """.trimIndent()
            )
        .When()
            .patch("/roles/$userRole")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)
    }
}
