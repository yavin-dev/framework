/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.yahoo.navi.ws.test.framework.IntegrationTest
import com.yahoo.navi.ws.test.framework.matchers.RegexMatcher
import org.apache.http.HttpStatus
import org.junit.Test
import org.hamcrest.Matchers.*
import com.jayway.restassured.RestAssured.given

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

    @Test
    fun userPermissions() {
        registerUser(naviUser1)
        registerUser(naviUser2)
        //post a report
        given()
            .header("User", naviUser1)
            .contentType("application/vnd.api+json")
            .body("""
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "A Report",
                            "request": {
                                "logicalTable":{
                                   "timeGrain":"day",
                                   "table":"base"
                                },
                                "bardVersion":"1.0",
                                "requestVersion":"2.0",
                                "intervals":[{
                                    "start":"2015-08-20 00:00:00.000",
                                    "end":"2015-08-21 00:00:00.000"
                                }],
                                "metrics": [
                                    {"metric": "m1"},
                                    {"metric": "m2", "parameters": {}}
                                ]
                            }
                        },
                        "relationships": {
                            "author": {
                                "data": {
                                    "type": "users",
                                    "id": "$naviUser1"
                                }
                            }
                        }
                    }
                }
            """.trimIndent())
        .When()
            .post("/reports")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        //should not be able to patch another user's record
        given()
            .header("User", naviUser2)
            .contentType("application/vnd.api+json")
            .body("""
                {
                    "data": {
                        "type": "users",
                        "id": "$naviUser1",
                        "relationships": {
                            "reports": {
                                "data": {
                                    "type": "reports",
                                    "id": 1
                                }
                            }
                        }
                    }
                }
            """.trimIndent())
        .When()
            .patch("/users/$naviUser1")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)

        //a user cannot claim another users's report
        given()
            .header("User", naviUser2)
            .contentType("application/vnd.api+json")
            .body("""
                {
                    "data": {
                        "type": "users",
                        "id": "$naviUser2",
                        "relationships": {
                            "reports": {
                                "data": {
                                    "type": "reports",
                                    "id": 1
                                }
                            }
                        }
                    }
                }
            """.trimIndent())
        .When()
            .patch("/users/$naviUser2")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)

        //a user cannot delete themselves
        given()
            .header("User", naviUser1)
            .contentType("application/vnd.api+json")
        .When()
            .delete("/users/$naviUser1")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)
    }

    @Test
    fun favoriteReports() {
        registerUser(naviUser1)
        registerUser(naviUser2)

        //add Report1
        given()
            .header("User", naviUser1)
            .contentType("application/vnd.api+json")
            .body("""
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "User 1's Report"
                        },
                        "relationships": {
                            "author": {
                                "data":{
                                    "type": "users",
                                    "id": "$naviUser1"
                                }
                            }
                        }
                    }
                }
            """.trimIndent())
        .When()
            .post("/reports")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        //add Report2
        given()
            .header("User", naviUser2)
            .contentType("application/vnd.api+json")
            .body("""
            {
                "data": {
                    "type": "reports",
                    "attributes": {
                        "title": "User 2's Report"
                    },
                    "relationships": {
                        "author": {
                            "data":{
                                "type": "users",
                                "id": "$naviUser2"
                            }
                        }
                    }
                }
            }
            """.trimIndent())
        .When()
            .post("/reports")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        //user starts out with no favorite reports
        given()
            .header("User", naviUser2)
            .contentType("application/vnd.api+json")
        .When()
            .get("/users/$naviUser1")
        .then()
            .assertThat()
            .body("data.relationships.favoriteReports.data", empty<Boolean>())

        //user can favorite their own reports and other users reports
        given()
            .header("User", naviUser1)
            .contentType("application/vnd.api+json")
            .body("""
                {
                    "data": {
                        "type": "users",
                        "id": "$naviUser1",
                        "relationships": {
                            "favoriteReports": {
                                "data":[
                                    {
                                        "type": "reports",
                                        "id": "1"
                                    },
                                    {
                                        "type": "reports",
                                        "id": "2"
                                    }
                                ]
                            }
                        }
                    }
                }
                """.trimIndent())
        .When()
            .patch("/users/$naviUser1")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        //favorited reports show up for user
        given()
            .header("User", naviUser1)
            .contentType("application/vnd.api+json")
        .When()
            .get("/users/$naviUser1")
        .then()
            .assertThat()
            .body("data.relationships.favoriteReports.data.id", hasItems("1", "2"))

        //user can remove a favorite report
        given()
            .header("User", naviUser1)
            .contentType("application/vnd.api+json")
            .body("""
                {
                    "data": {
                        "type": "users",
                        "id": "$naviUser1",
                        "relationships": {
                            "favoriteReports": {
                                "data":[
                                    {
                                        "type": "reports",
                                        "id": "1"
                                    }
                                ]
                            }
                        }
                    }
                }
                """.trimIndent())
        .When()
            .patch("/users/$naviUser1")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        //favorited report has been removed
        given()
            .header("User", naviUser1)
            .contentType("application/vnd.api+json")
        .When()
            .get("/users/$naviUser1")
        .then()
            .assertThat()
            .body("data.relationships.favoriteReports.data.id", not(hasItems("2")))

        //multiple users can favorite the same report
        given()
            .header("User", naviUser2)
            .contentType("application/vnd.api+json")
            .body("""
                {
                    "data": {
                        "type": "users",
                        "id": "$naviUser2",
                        "relationships": {
                            "favoriteReports": {
                                "data":[
                                    {
                                        "type": "reports",
                                        "id": "1"
                                    }
                                ]
                            }
                        }
                    }
                }
                """.trimIndent())
        .When()
            .patch("/users/$naviUser2")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        //favorite report still shows up for user1
        given()
            .header("User", naviUser1)
            .contentType("application/vnd.api+json")
        .When()
            .get("/users/$naviUser1")
        .then()
            .assertThat()
            .body("data.relationships.favoriteReports.data.id", hasItems("1"))

    }
}