package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.hamcrest.Matchers
import org.junit.jupiter.api.Test

class DemoDataSourceTest : IntegrationTest() {
    @Test
    fun simple_netflix_table_test() {
        given()
            .header("User", "testuser")
            .When()
            .get("/table/NetflixTitles")
            .then()
            .assertThat()
            .statusCode(200)
            .body("data.type", Matchers.equalTo("table"))
            .body("data.id", Matchers.equalTo("NetflixTitles"))
    }
}
