/**
 * Copyright 2022, Yahoo Holdings Inc.
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
            """var NAVI_APP = {"user":"testuser","dataSources":[{"name":"default","displayName":"Default","description":null,"hide":false,"uri":"/graphql/api/v1","type":"elide","namespaces":[{"name":"DemoNamespace","displayName":"Demo Namespace","description":null,"hide":false,"suggestedDataTables":["DemoNamespace_TrendingNow"]}],"suggestedDataTables":["NetflixTitles"],"timeout":900000}],"appPersistence":{"name":"persistence","displayName":"Persistence","description":null,"hide":false,"uri":"/api/v1","type":"elide","namespaces":[],"suggestedDataTables":[],"timeout":900000},"FEATURES":{"enableDashboardsFilters":true,"enableTableEditing":true,"enableTotals":true,"enableScheduleReports":true,"enableScheduleDashboards":true}};"""

        val actual: String = given()
            .header("User", "testuser")
            .When()
            .get("/ui/assets/server-generated-config.js")
            .then()
            .statusCode(200)
            .extract().response().asString()

        assertEquals(expected, actual)
    }
}
