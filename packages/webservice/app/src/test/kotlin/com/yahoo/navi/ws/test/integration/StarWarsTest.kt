package com.yahoo.navi.ws.test.integration

import com.yahoo.navi.ws.test.framework.IntegrationTest
import com.jayway.restassured.RestAssured.given
import org.hamcrest.Matchers
import org.junit.jupiter.api.Test
import org.hamcrest.Matchers.hasItems


class StarwarsTest: IntegrationTest() {
    @Test
    fun simple_starwars_table_test(){
        given()
                .header("User","testuser")
                .When()
                .get("/pilots")
                .then()
                .assertThat()
                .statusCode(200)
                .body("data[0].type",Matchers.equalTo("pilots"))
    }
}