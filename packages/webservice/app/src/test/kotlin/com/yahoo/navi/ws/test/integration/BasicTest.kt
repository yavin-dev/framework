package com.yahoo.navi.ws.test.integration

import com.yahoo.navi.ws.test.framework.IntegrationTest
import com.jayway.restassured.RestAssured.given
import org.junit.Test

class BasicTest: IntegrationTest() {
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