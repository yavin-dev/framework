package com.yahoo.navi.ws.test.integration

import com.yahoo.navi.ws.test.framework.IntegrationTest
import com.yahoo.navi.ws.test.framework.matchers.RegexMatcher
import org.apache.http.HttpStatus
import org.junit.Test
import org.hamcrest.Matchers.*
import com.jayway.restassured.RestAssured.given


/**
 * Copyright (c) 2019, Yahoo Inc.
 */
class UserTest: IntegrationTest() {
    private val naviUser1 = "user1"
    private val naviUser2 = "user2"

    fun registerUser(user: String) {
        given()
            .header("User", user)
            .contentType("application/vnd.api+json")
            .body(
                """
                    {
                        "data": {
                            "type": "users",
                            "id": "$user"
                        }
                    }
                """.trimIndent()
            )
        .When()
            .post("/users")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
    }

    @Test
    fun userEndpointTest() {

        /*
         * User endpoint is initially empty
         */
        given()
            .cookie("User", naviUser1)
        .When()
            .get("/users")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_OK)
            .and()
            .body("data", empty<Any>())

        /*
         * New user can be added
         */
        registerUser(naviUser1)

        /*
         * Created user is visible in users endpoint
         */
        given()
            .cookie("User", naviUser1)
        .When()
            .get("/users")
        .then()
            .assertThat()
            .body("data.id", hasItems<String>(naviUser1))
    }

    @Test
    fun securityTest() {
        /*
         * You cannot create a user under a different name
         */
        given()
            .cookie("User", naviUser1)
            .contentType("application/vnd.api+json")
            .body(
                """
                    {
                        "data": {
                            "type": "users",
                            "id": "$naviUser2"
                        }
                    }
                """.trimIndent()
            )
        .When()
            .post("/users")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)

        /*
         * Registering User1
         */
        registerUser(naviUser1)
    }

    @Test
    fun createDateTest() {
        val user1 = "test-user"

        /*
         * Add test user
         */
        registerUser(user1)

        /*
         * Check for created date
         */
        given()
            .cookie("User", user1)
        .When()
            .get("/users/$user1")
        .then()
            .assertThat()
            .body("data.attributes.createDate", nullValue())
        .and()
            .body("data.attributes.createdOn",
                RegexMatcher.matchesRegex("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}")) // YYYY-MM-DD HH:MM:ss


        given()
            .cookie("User", user1)
            .contentType("application/vnd.api+json")
            .body(
                    """
                {
                    "data": {
                        "type": "users",
                        "id": "$user1",
                        "attributes": {
                            "createdOn": "2015-12-10 10:56:23"
                        }
                    }
                }
                """.trimIndent()
            )
        .When()
            .patch("/users/$user1")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)
    }
}