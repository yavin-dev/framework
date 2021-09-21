package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.elide.test.jsonapi.JsonApiDSL.* // ktlint-disable no-wildcard-imports
import com.yahoo.navi.ws.test.framework.IntegrationTest
import com.yahoo.navi.ws.test.framework.matchers.JsonMatcher.Companion.matchesJsonMap
import com.yahoo.navi.ws.test.framework.matchers.RegexMatcher.Companion.matchesRegex
import org.apache.http.HttpStatus
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.hasItems
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class ReportTest : IntegrationTest() {
    private val USER1 = "user1"
    private val USER2 = "user2"

    private var reqStr = String()
    private var expectedReqStr = String()
    private var visualStr = String()
    private var owner = { user: String ->
        """
        |"owner": {
        |   "data": {
        |        "type": "users",
        |        "id": "$user"
        |    }
        |}
        """.trimMargin()
    }

    @BeforeEach
    fun setup() {
        reqStr = (
            """{
            |"filters":[{
            |   "field": "id",
            |   "values":["-1","102","103"],
            |   "type":"dimension",
            |   "operator":"include"
            |}],
            |"columns":[
            |{
            |   "field": "metric1",
            |   "type": "metric"
            |},
            |{
            |   "field": "metric2",
            |   "type": "metric"
            |},
            |{
            |   "field": "metric3",
            |   "type": "metric",
            |   "parameters": { "param1" : "paramVal1" }
            |},
            |{
            |   "field": "dim1",
            |   "type": "dimension"
            |},
            |{
            |   "field": "dim2",
            |   "type": "dimension"
            |}],
            | "table" : "base",
            | "dataSource": "",
            | "requestVersion":"2.0"
            |}
            """.trimMargin()
            )

        // The test Request string, Order does not matter since
        // our matcher compares JSON Elements
        expectedReqStr = (
            """{
            |"columns": [{
            |  "field": "metric1", 
            |  "type": "metric", 
            |  "parameters":{}
            |}, 
            |{
            |  "field":"metric2", 
            |  "type":"metric", 
            |  "parameters":{}
            |}, 
            |{
            |  "field":"metric3", 
            |  "type":"metric", 
            |  "parameters":{"param1":"paramVal1"}
            |}, 
            |{
            |  "field":"dim1", 
            |  "type":"dimension", 
            |  "parameters":{}
            |}, 
            |{
            |  "field":"dim2", 
            |  "type":"dimension", 
            |  "parameters":{}
            |}], 
            |"filters":[{"field":"id", "values":["-1", "102", "103"], "type":"dimension", "parameters":{}, "operator":"include"}], 
            |"requestVersion":"2.0", 
            |"sorts":[], 
            |"rollup": {"columnCids":[], "grandTotal":false},
            |"dataSource":"", 
            |"table":"base"
            |}
            """.trimMargin()
            )

        visualStr = (
            """{
            |"metadata":{
            |    "foo":"bar",
            |    "nestedFoo":{"innerFoo":"innerBar"}
            |},
            |"type":"chart",
            |"version":1
            |}""".trimMargin()
            )

        /***
         * Post test users
         */
        registerUser(USER1)
        registerUser(USER2)
    }

    @Test
    fun report() {
        // Post a report
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "A Report",
                            "request": $reqStr,
                            "visualization": $visualStr
                        },
                        "relationships": {
                            ${owner(USER1)}
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .post("/reports")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        // test that it exists
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .When()
            .get("/reports")
            .then()
            .assertThat()
            .body("data.id", hasItems("1"))
            .body("data[0].attributes.title", equalTo("A Report"))
            .body("data[0].attributes.request", matchesJsonMap(expectedReqStr))
            .body("data[0].attributes.visualization", matchesJsonMap(visualStr))

        // test patch
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "id": 1,
                        "attributes": {
                            "title": "Updated Title"
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .patch("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        // test if title is updated
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .When()
            .get("/reports/1")
            .then()
            .assertThat()
            .body("data.attributes.title", equalTo("Updated Title"))

        // test delete
        given()
            .header("User", USER1)
            .When()
            .delete("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        // make sure report doesn't exist
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .When()
            .get("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NOT_FOUND)
    }

    @Test
    fun reportSort() {
        val requestStr =
            """{
            |"filters":[{
            |   "field": "id",
            |   "values":["-1","102","103"],
            |   "type":"dimension",
            |   "operator":"include"
            |}],
            |"columns":[
            |{
            |   "field": "metric1",
            |   "type": "metric"
            |},
            |{
            |   "field": "metric2",
            |   "type": "metric"
            |},
            |{
            |   "field": "metric3",
            |   "type": "metric",
            |   "parameters": { "param1" : "paramVal1" }
            |},
            |{
            |   "field": "dim1",
            |   "type": "dimension"
            |},
            |{
            |   "field": "dim2",
            |   "type": "dimension"
            |}],
            |"table" : "base",
            |"dataSource": "",
            |"sorts": [
            |   {"field": "metric1", "direction": "asc"},
            |   {"field": "metric2", "direction": "desc"}
            |],
            |"requestVersion":"2.0"
            |}""".trimMargin()

        // Post a report
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "A Report",
                            "request": $requestStr,
                            "visualization": $visualStr
                        },
                        "relationships": {
                            ${owner(USER1)}
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .post("/reports")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        // check the sorts
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .When()
            .get("/reports/1")
            .then()
            .assertThat()
            .body("data.attributes.request.sorts.field", hasItems("metric1", "metric2"))
            .body("data.attributes.request.sorts.find { it.field == 'metric1'}.direction", equalTo("asc"))
            .body("data.attributes.request.sorts.find { it.field == 'metric2'}.direction", equalTo("desc"))
    }

    @Test
    fun wrongUser() {
        // Post a report with different owner
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "A Report",
                            "request": $reqStr,
                            "visualization": $visualStr
                        },
                        "relationships": {
                            ${owner(USER2)}
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .post("/reports")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)

        // make sure report doesn't exist
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .When()
            .get("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NOT_FOUND)
    }

    @Test
    fun `admin can modify user reports`() {
        val adminUser = "admin"
        val adminRole = "admin"
        registerUser(adminUser)
        registerRole(adminRole)
        registerUserRole(adminRole, adminUser)

        // admin can create for other users
        val createdId: String = given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "A Report",
                            "request": $reqStr,
                            "visualization": $visualStr
                        },
                        "relationships": {
                            ${owner(USER1)}
                        }
                    }
                }
                """.trimIndent(),
            )
            .When()
            .post("/reports")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
            .extract()
            .path("data.id")

        // admin can update for other users
        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .body(
                datum(
                    resource(
                        type("reports"),
                        id("1"),
                        attributes(
                            attr("title", "A new title")
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .patch("/reports/$createdId")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        // admin can delete for other users
        given()
            .header("User", adminUser)
            .`when`()
            .delete("reports/$createdId")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)
    }

    @Test
    fun differentOwnerPermissions() {
        // Post a report with different owner
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "A Report",
                            "request": $reqStr,
                            "visualization": $visualStr
                        },
                        "relationships": {
                            ${owner(USER1)}
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .post("/reports")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        given()
            .header("User", USER2)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "id": 1,
                        "attributes": {
                            "title": "Updated Title"
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .patch("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)

        given()
            .header("User", USER2)
            .When()
            .delete("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)
    }

    @Test
    fun createDate() {
        // Post a report
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "A Report",
                            "request": $reqStr,
                            "visualization": $visualStr
                        },
                        "relationships": {
                            ${owner(USER1)}
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .post("/reports")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        // check date fields
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .When()
            .get("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_OK)
            .body("data.attributes.createdOn", matchesRegex("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}"))
            .body("data.attributes.updatedOn", matchesRegex("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}"))
    }

    @Test
    fun userPermissions() {
        // Post a report
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "A Report",
                            "request": $reqStr,
                            "visualization": $visualStr
                        },
                        "relationships": {
                            ${owner(USER1)}
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .post("/reports")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        // non owner should not update a report
        given()
            .header("User", USER2)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "id": 1,
                        "attributes": {
                            "title": "Updated Title"
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .patch("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)

        // non owner should not be able to delete report
        given()
            .header("User", USER2)
            .When()
            .delete("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)
    }

    @Test
    fun deleteFavoritedReport() {
        val reportId: String = createReport(USER1)
        markAsFavorite(USER1, reportId)
        deleteReport(USER1, reportId)
    }

    fun createReport(user: String): String {
        // Post a report
        val id: String = given()
            .header("User", user)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": {
                        "type": "reports",
                        "attributes": {
                            "title": "A Report",
                            "request": $reqStr,
                            "visualization": $visualStr
                        },
                        "relationships": {
                            ${owner(user)}
                        }
                    }
                }
                """.trimIndent()
            )
            .When()
            .post("/reports")
            .then()
            .log().all()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
            .extract()
            .path("data.id")

        return id
    }

    fun markAsFavorite(user: String, reportId: String) {
        given()
            .header("User", user)
            .contentType("application/vnd.api+json")
            .body(
                """
                {
                    "data": [
                        { "type": "reports", "id": $reportId }
                    ]
                }
                """.trimIndent()
            )
            .When()
            .post("/users/$user/relationships/favoriteReports")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)
    }

    fun deleteReport(user: String, reportId: String) {
        given()
            .header("User", user)
            .When()
            .delete("/reports/$reportId")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)
    }
}
