/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.framework

import org.junit.After
import org.junit.AfterClass
import org.junit.BeforeClass
import com.yahoo.elide.standalone.ElideStandalone
import com.yahoo.navi.ws.app.Settings
import com.jayway.restassured.RestAssured
import org.junit.Assert
import java.sql.Connection
import java.sql.DriverManager
import java.sql.PreparedStatement
import java.sql.SQLException

abstract class IntegrationTest: RestAssuredSupport {
    companion object {
        /**
         * local elide stand alone instance
         */
        lateinit var App: ElideStandalone

        /**
         * H2 database connection parameters
         */
        private val DATABASE_CONNECTION_URL = "jdbc:h2:mem:db1;DB_CLOSE_DELAY=-1"
        private val DATABASE_USER = "SA"
        private val DATABASE_PASSWORD = ""

        /**
         * sets up rest assured and sets up the server
         */
        @BeforeClass
        @JvmStatic
        fun beforeTests() {
            setupRestAssured()
            setupServer()
        }

        /**
         * Rest assured knows about our service
         */
        fun setupRestAssured() {
            RestAssured.baseURI = "http://localhost/"
            RestAssured.basePath = "/api/v1"
            RestAssured.port = assuredPort()
            RestAssured.enableLoggingOfRequestAndResponseIfValidationFails()
        }

        /**
         * gets port used for testing
         */
        fun assuredPort(): Int {
            // Grab port assigned from pom.xml plugin
            val restassuredPort = System.getProperty("restassured.port", System.getenv("restassured.port"))
            return Integer.parseInt(if (restassuredPort != null && !restassuredPort.isEmpty()) restassuredPort else "9999")
        }

        /**
         * Creates and starts Jetty server
         */
        fun setupServer() {
            App = ElideStandalone(object : Settings() {
                override fun getPort(): Int {
                    return assuredPort()
                }

                override fun getHibernate5ConfigPath(): String {
                    return "./src/main/resources/hibernate.cfg.xml"
                }
            })

            App.start(false)
        }

        /**
         * Cleans up server
         * @throws Exception
         */
        @AfterClass
        @JvmStatic
        fun tearDownServer() {
            App.stop()
        }
    }

    /**
     * Execute select query and return number of rows
     * @param query
     * @return number of rows for a query
     */
    fun getCountForSelectQuery(query: String): Int {
        var numberOfRows = 0
        try {
            DriverManager.getConnection(DATABASE_CONNECTION_URL, DATABASE_USER, DATABASE_PASSWORD).use{ conn ->
                conn.createStatement().use{ stmt ->
                    val rs = stmt.executeQuery(query)
                    rs.last()
                    numberOfRows = rs.getInt(1)
                }
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            Assert.fail("Database Error: " + e.message)
        }

        return numberOfRows
    }

    /**
     * Clears database between tests
     * @throws Exception
     */
    @After
    fun restartServer() {
        // Clear the database by restarting the server
        App.stop()
        App.start(false)
    }

}