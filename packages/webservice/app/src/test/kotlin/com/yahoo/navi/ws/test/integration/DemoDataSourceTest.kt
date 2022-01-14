package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.hamcrest.Matchers
import org.junit.jupiter.api.Test

class DemoDataSourceTest : IntegrationTest() {
    @Test
    fun `access tables via tables entity`() {

        // default namespace table
        given()
            .header("User", "testuser")
            .When()
            .get("/table/NetflixTitles")
            .then()
            .assertThat()
            .statusCode(200)
            .body("data.id", Matchers.equalTo("NetflixTitles"))

        // DemoNamespace namespace table
        given()
            .header("User", "testuser")
            .When()
            .get("/table/DemoNamespace_TrendingNow")
            .then()
            .assertThat()
            .statusCode(200)
            .body("data.id", Matchers.equalTo("DemoNamespace_TrendingNow"))
    }

    @Test
    fun `access tables via namespace entity`() {

        // default namespace table
        given()
            .header("User", "testuser")
            .When()
            .get("/namespace/default/tables/NetflixTitles")
            .then()
            .assertThat()
            .statusCode(200)
            .body("data.id", Matchers.equalTo("NetflixTitles"))

        // DemoNamespace namespace table
        given()
            .header("User", "testuser")
            .When()
            .get("/namespace/DemoNamespace/tables/DemoNamespace_TrendingNow")
            .then()
            .assertThat()
            .statusCode(200)
            .body("data.id", Matchers.equalTo("DemoNamespace_TrendingNow"))
    }
}
