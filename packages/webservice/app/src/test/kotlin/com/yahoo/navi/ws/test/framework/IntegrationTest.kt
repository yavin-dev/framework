package com.yahoo.navi.ws.test.framework

import org.junit.After
import org.junit.AfterClass
import org.junit.BeforeClass
import com.yahoo.elide.standalone.ElideStandalone
import com.yahoo.navi.ws.app.Settings
import com.jayway.restassured.RestAssured

abstract class IntegrationTest: RestAssuredSupport {
    companion object {
        /**
         * local elide stand alone instance
         */
        lateinit var App: ElideStandalone

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