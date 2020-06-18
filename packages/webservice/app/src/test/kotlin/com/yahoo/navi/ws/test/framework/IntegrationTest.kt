/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.framework

import com.jayway.restassured.RestAssured
import com.jayway.restassured.RestAssured.given
import com.yahoo.elide.spring.config.ElideConfigProperties
import org.apache.http.HttpStatus
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.fail
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.web.server.LocalServerPort
import org.springframework.test.annotation.DirtiesContext
import java.sql.SQLException
import javax.persistence.EntityManager

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
abstract class IntegrationTest : RestAssuredSupport {

    @Autowired
    private lateinit var elideConfig: ElideConfigProperties

    @Autowired
    private lateinit var entityManager: EntityManager

    @LocalServerPort
    var port = 0

    @BeforeEach
    fun setUp() {
        RestAssured.port = port
        RestAssured.basePath = this.elideConfig.jsonApi.path
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails()
    }

    /**
     * Registers a test user
     */
    fun registerUser(user: String) {
        given()
            .header("User", user)
            .contentType("application/vnd.api+json")
            .body("""
                {
                    "data": {
                        "type": "users",
                        "id": "$user"
                    }
                }
            """.trimIndent())
        .When()
            .post("/users")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
    }

    /**
     * Registers a test role
     */
    fun registerRole(role: String, user: String) {
        given()
            .header("User", user)
            .contentType("application/vnd.api+json")
            .body("""
                {
                    "data": {
                        "type": "roles",
                        "id": "$role"
                    }
                }
            """.trimIndent())
        .When()
            .post("/roles")
        .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
    }

    /**
     * Execute a select query and return the result set size
     * @return number returned by COUNT query
     */
    fun getCountForSelectQuery(query: String): Int {
        var numberOfRows: Int
        try {
            val rs = this.entityManager.createQuery(query)
            numberOfRows = rs.resultList.size
        } catch (e: SQLException) {
            e.printStackTrace()
            fail("Database Error: " + e.message)
        }

        return numberOfRows
    }
}
