/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.apache.http.HttpStatus
import org.hamcrest.CoreMatchers.equalTo
import org.hamcrest.CoreMatchers.nullValue
import org.junit.jupiter.api.Test

class AsyncQueryTest : IntegrationTest() {

    private val user = "user"
    private val adminUser = "adminUser"
    private val guestUser = "guestUser"
    private val adminRole = "admin"
    private val guestRole = "guest"
    private val id = "edc4a871-dff2-4054-804e-d80075cf830e"

    @Test
    fun testAsyncQueryPermissions() {

        registerUser(user)
        registerUser(adminUser)
        registerUser(guestUser)
        registerRole(adminRole)
        registerRole(guestRole)
        registerUserRole(adminRole, adminUser)
        registerUserRole(guestRole, guestUser)

        given()
            .header("User", user)
            .contentType("application/vnd.api+json")
            .body(
                """
                    {
                        "data": {
                            "type": "asyncQuery",
                            "id": "$id",
                            "attributes": {
                                "asyncAfterSeconds": 0,
                                "query": "/roles",
                                "queryType": "JSONAPI_V1_0",
                                "status": "QUEUED",
                                "resultFormatType": "JSONAPI",
                                "resultType": "EMBEDDED"
                            }
                        }
                    }
                """.trimIndent()
            )
            .When()
            .post("asyncQuery")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
            .body("data.id", equalTo(id))
            .body("data.type", equalTo("asyncQuery"))
            .body("data.attributes.status", equalTo("PROCESSING"))
            .body("data.attributes.result", nullValue())

        /*
         * Owner can query the status
         */
        given()
            .header("User", user)
            .contentType("application/vnd.api+json")
            .When()
            .get("/asyncQuery/$id")
            .then()
            .statusCode(org.apache.http.HttpStatus.SC_OK)

        /*
         * Admin can query the status
         */
        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .When()
            .get("/asyncQuery/$id")
            .then()
            .statusCode(org.apache.http.HttpStatus.SC_OK)

        /*
         * No other user can query the status
         */
        given()
            .header("User", guestUser)
            .contentType("application/vnd.api+json")
            .When()
            .get("/asyncQuery/$id")
            .then()
            .statusCode(org.apache.http.HttpStatus.SC_NOT_FOUND)
    }
}
