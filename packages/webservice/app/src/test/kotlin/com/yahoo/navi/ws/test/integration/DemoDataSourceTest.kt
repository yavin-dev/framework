package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import liquibase.Contexts
import liquibase.Liquibase
import liquibase.database.DatabaseFactory
import liquibase.database.jvm.JdbcConnection
import liquibase.resource.ClassLoaderResourceAccessor
import org.hamcrest.Matchers
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import java.sql.DriverManager

class DemoDataSourceTest : IntegrationTest() {

    @BeforeAll
    fun initial() {
        val connection = DriverManager.getConnection("jdbc:h2:file:/tmp/demoDB;DB_CLOSE_DELAY=-1", "guest", "")
        val database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(JdbcConnection(connection))
        val liquibase = liquibase.Liquibase("db/changelog/changelog-demo.xml", ClassLoaderResourceAccessor(), database)
        liquibase.update(Contexts())
    }

    @Test
    fun simple_starwars_table_test() {
        given()
            .header("User", "testuser")
            .When()
            .get("/pilots")
            .then()
            .assertThat()
            .statusCode(200)
            .body("data[0].type", Matchers.equalTo("pilots"))
    }
}
