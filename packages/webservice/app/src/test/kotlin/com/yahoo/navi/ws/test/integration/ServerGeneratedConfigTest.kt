/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured
import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class ServerGeneratedConfigTest : IntegrationTest() {

    @BeforeEach
    override fun setUp() {
        super.setUp()
        RestAssured.basePath = "/"
    }

    @Test
    fun server_generated_config() {
        val expected: String? =
            """var NAVI_APP = {"appSettings":{"factApiHost":"","persistenceApiHost":"/api/v1","user":"testuser"},"features":{"enableDashboardsFilters":true,"enableTableEditing":true,"enableTotals":true}};"""

        val actual: String = given()
            .header("User", "testuser")
            .When()
            .get("/assets/server-generated-config.js")
            .then()
            .statusCode(200)
            .extract().response().asString()

        assertEquals(expected, actual)
    }
}
