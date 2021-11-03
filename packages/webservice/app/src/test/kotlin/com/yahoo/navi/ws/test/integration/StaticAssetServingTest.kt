/**
 * Copyright 2021 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.integration

import com.jayway.restassured.RestAssured
import com.jayway.restassured.RestAssured.given
import com.yahoo.navi.ws.test.framework.IntegrationTest
import org.hamcrest.Matchers.both
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.hasLength
import org.hamcrest.Matchers.startsWith
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class StaticAssetServingTest : IntegrationTest() {

    @BeforeEach
    override fun setUp() {
        super.setUp()
        RestAssured.basePath = "/"
    }

    @Test
    fun cache_static_assets_test() {
        val noCacheHeader = "max-age=0"
        given()
            .header("User", "testuser")
            .expect()
            .header("Cache-Control", noCacheHeader)
            .header("Etag", both(startsWith("W/")).and(hasLength(37)))
            .header("Content-Encoding", "gzip")
            .statusCode(200)
            .get("/ui/")
        given()
            .header("User", "testuser")
            .expect()
            .header("Cache-Control", noCacheHeader)
            .header("Etag", both(startsWith("W/")).and(hasLength(37)))
            .header("Content-Type", "application/javascript;charset=UTF-8")
            .statusCode(200)
            .get("/ui/assets/server-generated-config.js")

        val indexHtml =
            ClassLoader.getSystemClassLoader().getResource("META-INF/resources/ui/index.html")?.readText() ?: ""
        val cssRegex = Regex("<link rel=\"stylesheet\" href=\"(/ui/assets/vendor(.*)\\.css)\" />")
        val jsRegex = Regex("<script src=\"(/ui/assets/navi-app(.*)\\.js)\"></script>")

        val css = cssRegex.find(indexHtml)?.groups?.elementAt(1)?.value ?: ""
        val js = jsRegex.find(indexHtml)?.groups?.elementAt(1)?.value ?: ""

        val cacheControlHeader = "max-age=60, must-revalidate"
        given()
            .header("User", "testuser")
            .expect()
            .header("Cache-Control", cacheControlHeader)
            .header("Etag", both(startsWith("W/")).and(hasLength(37)))
            .header("Content-Type", "image/svg+xml")
            .statusCode(200)
            .get("/ui/img/yavin-logo.svg")
        given()
            .header("User", "testuser")
            .expect()
            .header("Cache-Control", cacheControlHeader)
            .header("Etag", both(startsWith("W/")).and(hasLength(37)))
            .header("Content-Type", "text/css")
            .statusCode(200)
            .get(css)

        given()
            .header("User", "testuser")
            .expect()
            .header("Cache-Control", cacheControlHeader)
            .header("Etag", both(startsWith("W/")).and(hasLength(37)))
            .header("Content-Encoding", "gzip")
            .header("Content-Type", "application/javascript")
            .statusCode(200)
            .get(js)
    }

    @Test
    fun landing_page_test() {
        val content = ClassLoader.getSystemClassLoader().getResource("META-INF/resources/ui/index.html")?.readText()

        val response = given()
            .header("User", "testuser")
            .redirects().follow(false)
            .expect()
            .statusCode(302)
            .get("/")

        val location = response.getHeader("Location")
        Assertions.assertTrue(location.endsWith("/ui/"))

        given()
            .header("User", "testuser")
            .When()
            .get(location)
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }

    @Test
    fun ui_route_test() {
        val content = ClassLoader.getSystemClassLoader().getResource("META-INF/resources/ui/index.html")?.readText()

        given()
            .header("User", "testuser")
            .When()
            .get("/ui/123")
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }

    @Test
    fun api_landing_page_test() {
        val content = ClassLoader.getSystemClassLoader().getResource("META-INF/resources/api/index.html")?.readText()

        given()
            .header("User", "testuser")
            .When()
            .get("/api/index.html")
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }

    @Test
    fun swagger_landing_page_test() {
        val content =
            ClassLoader.getSystemClassLoader().getResource("META-INF/resources/swagger/index.html")?.readText()

        given()
            .header("User", "testuser")
            .When()
            .get("/swagger/index.html")
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }

    @Test
    fun graphiql_landing_page_test() {
        val content =
            ClassLoader.getSystemClassLoader().getResource("META-INF/resources/graphiql/index.html")?.readText()

        given()
            .header("User", "testuser")
            .When()
            .get("/graphiql/index.html")
            .then()
            .body(equalTo(content))
            .statusCode(200)
    }
}
