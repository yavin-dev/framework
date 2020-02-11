package com.yahoo.navi.spring.tests;

import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

import com.yahoo.elide.core.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;

public class UITest extends IntegrationTest {
  @Test
  public void elideLoaded() {
    given()
      .auth()
      .preemptive()
      .basic("navi-user", "password")
    .when()
      .get("/json/users")
    .then()
      .body("data", hasSize(0))
      .statusCode(HttpStatus.SC_OK);
  }

  @Test
  public void serverGeneratedConfig()  {
    given()
      .auth()
      .preemptive()
      .basic("navi-user", "password")
    .when()
      .get("/assets/server-generated-config.js")
    .then()
      .body(containsString("\"user\":\"navi-user\""))
      .body(containsString("var NAVI_APP = "))
      .body(containsString("\"persistenceApiHost\":\"/json\""))
      .body(containsString("\"factApiHost\":\"https://localhost:4443\""))
      .statusCode(HttpStatus.SC_OK);
  }
}