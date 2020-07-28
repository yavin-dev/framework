/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.framework

import com.jayway.restassured.specification.RequestSpecification

/**
 * when is a keyword in kotlin. So this creates a When alternative.
 */
interface RestAssuredSupport {
    fun RequestSpecification.When(): RequestSpecification {
        return this.`when`()
    }
}
