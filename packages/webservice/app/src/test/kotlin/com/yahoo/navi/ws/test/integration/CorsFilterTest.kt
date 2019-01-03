package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.junit.Test
import org.hamcrest.Matchers.*

class CorsFilterTest: IntegrationTest() {
    @Test
    fun allowOriginTest() {
        val testOrigin = "https://navi.yahoo.com"

        /*
         * Web service allows access from any origin
         */
        given()
                .header("Origin", testOrigin)
                .header("User", "testuser")
            .When()
                .get("/")
            .then()
                .assertThat()
                .header("Access-Control-Allow-Origin", testOrigin)

        /*
         * When no origin header is given, all origins are allowed
         */
        given()
                .header("User", "testuser")
            .When()
                .get("/")
            .then()
                .assertThat()
                .header("Access-Control-Allow-Origin", "*")
    }

    @Test
    fun allowHeadersTest() {
        val testHeaders = "origin, content-type, accept"

        /*
         * Web service allows any requested header
         */
        given()
                .header("Access-Control-Request-Headers", testHeaders)
                .header("User", "testuser")
            .When()
                .get("/")
            .then()
                .assertThat()
                .header("Access-Control-Allow-Headers", testHeaders)

        /*
         * Allowed headers is empty when none are given
         */
        given()
                .header("User", "testuser")
            .When()
                .get("/")
            .then()
                .assertThat()
                .header("Access-Control-Allow-Headers", nullValue())
    }

    @Test
    fun allowMethodsTest() {
        /*
         * All methods are echoed and thus allowed
         */
        given()
                .header("User", "testuser")
            .When()
                .options("/")
            .then()
                .assertThat()
                .header("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PATCH,DELETE")
    }

    @Test
    fun allowCredentialsTest() {
        given()
                .header("User", "testuser")
            .When()
                .options("/users")
            .then()
                .assertThat()
                .header("Access-Control-Allow-Credentials", "true")
    }
}