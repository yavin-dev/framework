/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.junit.jupiter.api.Test

class BasicTest : IntegrationTest() {
    @Test
    fun basic_server_hello() {
        given()
                .header("User", "testuser")
        .When()
                .get("/")
        .then()
                .statusCode(404)
    }
}