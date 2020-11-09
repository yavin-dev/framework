/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured
import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.hamcrest.CoreMatchers.equalTo
import org.junit.jupiter.api.Assertions
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
        val content = this.javaClass::class.java.getResource("/META-INF/resources/ui/index.html").readText()

        val response = given()
            .header("User", "testuser")
            .redirects().follow(false)
            .expect()
            .statusCode(302)
            .get("/")

        val location = response.getHeader("Location")
        Assertions.assertTrue(location.endsWith("/ui/"))

        given()
            .header("User", "testuser")
            .When()
            .get(location)
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }

    @Test
    fun ui_route_test() {
        val content = this.javaClass::class.java.getResource("/META-INF/resources/ui/index.html").readText()

        given()
            .header("User", "testuser")
            .When()
            .get("/ui/123")
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }

    @Test
    fun api_landing_page_test() {
        val content = this.javaClass::class.java.getResource("/META-INF/resources/api/index.html").readText()

        given()
            .header("User", "testuser")
            .When()
            .get("/api/index.html")
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }

    @Test
    fun swagger_landing_page_test() {
        val content = this.javaClass::class.java.getResource("/META-INF/resources/swagger/index.html").readText()

        given()
            .header("User", "testuser")
            .When()
            .get("/swagger/index.html")
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }

    @Test
    fun graphiql_landing_page_test() {
        val content = this.javaClass::class.java.getResource("/META-INF/resources/graphiql/index.html").readText()

        given()
            .header("User", "testuser")
            .When()
            .get("/graphiql/index.html")
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }
}
