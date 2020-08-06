/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured
import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class StaticAssetServingTest : IntegrationTest() {

    @BeforeEach
    override fun setUp() {
        super.setUp()
        RestAssured.basePath = "/"
    }

    @Test
    fun landing_page_test() {
        given()
            .header("User", "testuser")
            .When()
            .get("/index.html")
            .then()
            .log().all()
            .statusCode(200)
    }

    @Test
    fun api_landing_page_test() {
        given()
            .header("User", "testuser")
            .When()
            .get("/api/index.html")
            .then()
            .log().all()
            .statusCode(200)
    }

    @Test
    fun swagger_landing_page_test() {
        given()
            .header("User", "testuser")
            .When()
            .get("/swagger/index.html")
            .then()
            .log().all()
            .statusCode(200)
    }

    @Test
    fun graphiql_landing_page_test() {
        given()
            .header("User", "testuser")
            .When()
            .get("/graphiql/index.html")
            .then()
            .log().all()
            .statusCode(200)
    }
}
