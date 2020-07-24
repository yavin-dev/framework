/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.elide.core.HttpStatus
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.junit.jupiter.api.Test

class CorsFilterTest : IntegrationTest() {
    val origin = "https://www.navi.yahoo.com"
    val requestHeaders = "origin,content-type,accept"

    @Test
    fun `it can return cors headers`() {
        given()
            .header("Origin", origin)
            .header("Access-Control-Request-Method", "GET")
            .header("Access-Control-Request-Headers", requestHeaders)
            .When()
            .options("/users")
            .then()
            .assertThat()
            .header("Access-Control-Allow-Origin", origin)
            .header("Access-Control-Allow-Credentials", "true")
            .header("Access-Control-Allow-Methods", "HEAD,GET,POST,PATCH,DELETE")
            .statusCode(HttpStatus.SC_OK)
    }

    @Test
    fun `it rejects bad request methods`() {
        given()
            .header("Origin", origin)
            .header("Access-Control-Request-Method", "BAD_METHOD")
            .header("Access-Control-Request-Headers", requestHeaders)
            .When()
            .options("/users/")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)
    }
}
