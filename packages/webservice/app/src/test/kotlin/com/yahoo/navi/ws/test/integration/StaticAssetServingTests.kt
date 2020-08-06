/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.junit.jupiter.api.Test

class StaticAssetServingTests : IntegrationTest() {
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
}
