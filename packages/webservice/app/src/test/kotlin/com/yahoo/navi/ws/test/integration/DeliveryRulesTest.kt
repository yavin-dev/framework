package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured.given
import com.yahoo.elide.test.jsonapi.JsonApiDSL.* // ktlint-disable no-wildcard-imports
import com.yahoo.navi.ws.models.beans.enums.DeliveryType
import com.yahoo.navi.ws.models.beans.fragments.DeliveryFormat
import com.yahoo.navi.ws.models.beans.fragments.FormatOptions
import com.yahoo.navi.ws.models.beans.fragments.SchedulingRules
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.apache.http.HttpStatus
import org.hamcrest.Matchers
import org.hamcrest.Matchers.containsInAnyOrder
import org.hamcrest.Matchers.empty
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.hasItems
import org.hamcrest.Matchers.nullValue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class DeliveryRulesTest : IntegrationTest() {
    private val USER1 = "user1"
    private val USER2 = "user2"
    private val format: DeliveryFormat = DeliveryFormat(DeliveryType.csv)
    private val schedulingRules: SchedulingRules = SchedulingRules(false)

    @BeforeEach
    fun setup() {
        // Add Users
        registerUser(USER1)
        registerUser(USER2)

        // Add Report
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("reports"),
                        attributes(
                            attr("title", "A report")
                        ),
                        relationships(
                            relation(
                                "owner",
                                linkage(
                                    type("users"),
                                    id(USER1)
                                )
                            )
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/reports")

        // Add Dashboard
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("dashboards"),
                        attributes(
                            attr("title", "A dashboard")
                        ),
                        relationships(
                            relation(
                                "owner",
                                linkage(
                                    type("users"),
                                    id(USER1)
                                )
                            )
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/dashboards")
    }

    @Test
    fun `it can create delivery rules for a report`() {
        // add report deliveryRule
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr(
                                "recipients",
                                arrayOf("email1@yavin.dev", "email2@yavin.dev", "email3@yavin.dev")
                            ),
                            attr("version", "1"),
                            attr("schedulingRules", schedulingRules),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules/1"]
            .then()
            .assertThat()
            .body(
                "data.id", equalTo("1"),
                "data.attributes.delivery", equalTo("email"),
                "data.attributes.isDisabled", equalTo(false),
                "data.attributes.failureCount", equalTo(0),
                "data.attributes.deliveryType", equalTo("report"),
                "data.attributes.frequency", equalTo("week"),
                "data.attributes.format.type", equalTo("csv"),
                "data.attributes.schedulingRules.mustHaveData", equalTo(false),
                "data.attributes.recipients", hasItems("email1@yavin.dev", "email2@yavin.dev", "email3@yavin.dev"),
                "data.attributes.lastDeliveredOn", nullValue(),
                "data.attributes.dataSources", equalTo(emptyList<String>()), // no request, no dataSources
                "data.relationships.owner.data.id", equalTo(USER1),
                "data.relationships.deliveredItem.data.type", equalTo("reports"),
                "data.relationships.deliveredItem.data.id", equalTo("1"),
                "data.attributes.name", equalTo("Test Name"),
            )

        // add a second report deliveryRule
        given()
            .header("User", USER2)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "day"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER2)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        // add a dashboard deliveryRule
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "day"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("dashboards"), id("2"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        // test deliveryRule collection
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules"]
            .then()
            .assertThat()
            .body("data.id", Matchers.hasItems("3"))

        // Test report relationship
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/reports/1"]
            .then()
            .assertThat()
            .body(
                "data.relationships.deliveryRules.data[0].id", equalTo("1"),
                "data.relationships.deliveryRules.data[0].type", equalTo("deliveryRules"),
                "data.relationships.deliveryRules.data.size()", equalTo(2)
            )

        // Test dashboard relationship
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/dashboards/2"]
            .then()
            .assertThat()
            .body("data.relationships.deliveryRules.data.size()", Matchers.equalTo(1))
    }

    @Test
    fun `it can cannot create a new deliveryRule while setting lastDeliveredOn`() {
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("lastDeliveredOn", "2018-12-03 00:00:00"),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)
    }

    @Test
    fun `it can update delivery rules`() {
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                datum(
                    resource(
                        type("deliveryRules"),
                        id("1"),
                        attributes(
                            attr("frequency", "quarter"),
                            attr("schedulingRules", SchedulingRules(true)),
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .patch("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                datum(
                    resource(
                        type("deliveryRules"),
                        id("1"),
                        attributes(
                            attr("delivery", "none"),
                            attr("isDisabled", true),
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .patch("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules/1"]
            .then()
            .assertThat()
            .body(
                "data.attributes.frequency", equalTo("quarter"),
                "data.attributes.schedulingRules.mustHaveData", equalTo(true),
                "data.attributes.delivery", equalTo("none"),
                "data.attributes.isDisabled", equalTo(true)
            )

        given()
            .header("User", USER1)
            .`when`()
            .delete("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)
    }

    @Test
    fun `it validates values`() {

        // frequency must be one of: day, week, month, quarter
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "moon"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_BAD_REQUEST)

        // cannot have empty recipients
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf<String>()),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_BAD_REQUEST)

        // cannot have missing recipients
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_BAD_REQUEST)

        // cannot contain recipient that isn't a valid email
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("user1@yavin.dev", "uasdf")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_BAD_REQUEST)

        // cannot have null delivery
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("delivery", null),
                            attr("frequency", "week"),
                            attr("version", "1"),
                            attr("recipients", arrayOf("user1@yavin.dev")),
                            attr("format", format),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_BAD_REQUEST)
    }

    @Test
    fun `it has authorization rules`() {
        // Cannot create for different user
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "day"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER2)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "day"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        // cannot update as different user
        given()
            .header("User", USER2)
            .contentType("application/vnd.api+json")
            .body(
                datum(
                    resource(
                        type("deliveryRules"),
                        id("1"),
                        attributes(
                            attr("frequency", "month"),
                            attr("isDisabled", false),
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .patch("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)

        // cannot delete as different user
        given()
            .header("User", USER2)
            .`when`()
            .delete("deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_FORBIDDEN)
    }

    @Test
    fun `admin can modify user delivery rules`() {
        val adminUser = "admin"
        val adminRole = "admin"
        registerUser(adminUser)
        registerRole(adminRole)
        registerUserRole(adminRole, adminUser)

        // admin can create for other users
        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "day"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER2)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        // admin can update for other users
        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .body(
                datum(
                    resource(
                        type("deliveryRules"),
                        id("1"),
                        attributes(
                            attr("frequency", "month"),
                            attr("isDisabled", false),
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .patch("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        // admin can delete for other users
        given()
            .header("User", adminUser)
            .`when`()
            .delete("deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)
    }

    @Test
    fun `it can delete a delivery rule`() {
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules"]
            .then()
            .assertThat()
            .body("data.id", Matchers.hasItems("1"))

        given()
            .header("User", USER1)
            .`when`()
            .delete("/reports/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules"]
            .then()
            .assertThat()
            .body("data.size()", Matchers.equalTo(0))
    }

    @Test
    fun `it provides the report dataSource`() {
        var dataSource = "dataSourceA"

        val reportId: String = given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("reports"),
                        attributes(
                            attr("title", "A report"),
                            attr(
                                "request",
                                attributes(
                                    attr("dataSource", dataSource)
                                )
                            )
                        ),
                        relationships(
                            relation(
                                "owner",
                                linkage(
                                    type("users"),
                                    id(USER1)
                                )
                            )
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/reports")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
            .extract()
            .path("data.id")

        val ruleId: String = given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev")),
                            attr("version", "1"),
                            attr("schedulingRules", schedulingRules),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id(reportId))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
            .extract()
            .path("data.id")

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules/$ruleId"]
            .then()
            .assertThat()
            .body(
                "data.attributes.dataSources", equalTo(listOf(dataSource)),
            )
    }

    @Test
    fun `it provides the dashboard dataSources`() {
        val dataSources = listOf("dataSourceA", "dataSourceB", "dataSourceC", "dataSourceA")

        val dashboardId: String = given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("dashboards"),
                        attributes(
                            attr("title", "A dashboard"),
                        ),
                        relationships(
                            relation(
                                "owner",
                                linkage(
                                    type("users"),
                                    id(USER1)
                                )
                            )
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/dashboards")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
            .extract()
            .path("data.id")

        dataSources.forEach { dataSource ->
            given()
                .header("User", USER1)
                .contentType("application/vnd.api+json")
                .body(
                    data(
                        resource(
                            type("dashboardWidgets"),
                            attributes(
                                attr("title", "A dashboard widget for $dataSource"),
                                attr(
                                    "requests",
                                    arrayListOf(
                                        attributes(
                                            attr("dataSource", dataSource)
                                        )
                                    )
                                )
                            )
                        )
                    ).toJSON()
                )
                .`when`()
                .post("/dashboards/$dashboardId/widgets")
                .then()
                .assertThat()
                .statusCode(HttpStatus.SC_CREATED)
        }

        val ruleId: String = given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev")),
                            attr("version", "1"),
                            attr("schedulingRules", schedulingRules),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("dashboards"), id(dashboardId))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)
            .extract()
            .path("data.id")

        // Test that dataSources is the set of widget dataSources
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules/$ruleId"]
            .then()
            .assertThat()
            .body(
                "data.attributes.dataSources", containsInAnyOrder("dataSourceA", "dataSourceB", "dataSourceC")
            )

        // Test that dataSources filtering
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules?filter=dataSources=hasmember=dataSourceA;dataSources=hasnomember=dataSourceD"]
            .then()
            .assertThat()
            .body(
                "data.id", hasItems("1")
            )

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules?filter=dataSources=hasmember=dataSourceA;dataSources=hasmember=dataSourceD"]
            .then()
            .assertThat()
            .body(
                "data.id", empty<Any>()
            )
    }

    @Test
    fun `format options`() {
        val formatWithOptions: DeliveryFormat = DeliveryFormat(DeliveryType.gsheet, FormatOptions(true))
        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", formatWithOptions),
                            attr("delivery", "email"),
                            attr(
                                "recipients",
                                arrayOf("email1@yavin.dev", "email2@yavin.dev", "email3@yavin.dev")
                            ),
                            attr("version", "1"),
                            attr("schedulingRules", schedulingRules),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules/1"]
            .then()
            .assertThat()
            .body(
                "data.id", equalTo("1"),
                "data.attributes.format.type", equalTo("gsheet"),
                "data.attributes.format.options.overwriteFile", equalTo(true),
                "data.relationships.deliveredItem.data.type", equalTo("reports"),
                "data.relationships.deliveredItem.data.id", equalTo("1")
            )

        formatWithOptions.options?.overwriteFile = false

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .body(
                datum(
                    resource(
                        type("deliveryRules"),
                        id("1"),
                        attributes(
                            attr("format", formatWithOptions),
                            attr("isDisabled", false),
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .patch("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        given()
            .header("User", USER1)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules/1"]
            .then()
            .assertThat()
            .body(
                "data.id", equalTo("1"),
                "data.attributes.format.type", equalTo("gsheet"),
                "data.attributes.format.options.overwriteFile", equalTo(false)
            )
    }

    @Test
    fun `updating failure count disables rule`() {
        val adminUser = "admin"
        val adminRole = "admin"
        registerUser(adminUser)
        registerRole(adminRole)
        registerUserRole(adminRole, adminUser)

        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .body(
                data(
                    resource(
                        type("deliveryRules"),
                        attributes(
                            attr("frequency", "week"),
                            attr("format", format),
                            attr("delivery", "email"),
                            attr("recipients", arrayOf("email1@yavin.dev", "email2@yavin.dev")),
                            attr("version", "1"),
                            attr("isDisabled", false),
                            attr("name", "Test Name")
                        ),
                        relationships(
                            relation("deliveredItem", linkage(type("reports"), id("1"))),
                            relation("owner", linkage(type("users"), id(USER1)))
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .post("/deliveryRules")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_CREATED)

        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .body(
                datum(
                    resource(
                        type("deliveryRules"),
                        id("1"),
                        attributes(
                            attr("failureCount", 4),
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .patch("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules/1"]
            .then()
            .assertThat()
            .body(
                "data.attributes.failureCount", equalTo(4),
                "data.attributes.isDisabled", equalTo(true)
            )

        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .body(
                datum(
                    resource(
                        type("deliveryRules"),
                        id("1"),
                        attributes(
                            attr("frequency", "day"),
                            attr("failureCount", 0),
                            attr("isDisabled", false),
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .patch("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules/1"]
            .then()
            .assertThat()
            .body(
                "data.attributes.frequency", equalTo("day"),
                "data.attributes.failureCount", equalTo(0),
                "data.attributes.isDisabled", equalTo(false)
            )

        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .body(
                datum(
                    resource(
                        type("deliveryRules"),
                        id("1"),
                        attributes(
                            attr("failureCount", 7),
                        )
                    )
                ).toJSON()
            )
            .`when`()
            .patch("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)

        given()
            .header("User", adminUser)
            .contentType("application/vnd.api+json")
            .`when`()["/deliveryRules/1"]
            .then()
            .assertThat()
            .body(
                "data.attributes.failureCount", equalTo(7),
                "data.attributes.isDisabled", equalTo(true)
            )

        given()
            .header("User", adminUser)
            .`when`()
            .delete("/deliveryRules/1")
            .then()
            .assertThat()
            .statusCode(HttpStatus.SC_NO_CONTENT)
    }
}
