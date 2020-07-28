/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.test.framework.matchers

import com.google.common.collect.Maps
import com.jayway.restassured.path.json.JsonPath
import org.hamcrest.Description
import org.hamcrest.TypeSafeMatcher

class JsonMatcher(private val expected: String) : TypeSafeMatcher<Map<String, Any>>() {
    /**
     * {@inheritDoc}
     */
    override fun describeTo(description: Description) {
        description.appendText("matches json=`$expected`")
    }

    /**
     * {@inheritDoc}
     */
    override fun matchesSafely(actual: Map<String, Any>): Boolean {
        val expectedParsed = JsonPath(expected).getMap<String, Any>("")
        val diff = Maps.difference(expectedParsed, actual)
        return diff.areEqual()
    }

    companion object {

        /**
         * Helper for making RegexMatcher
         * @param regex expression to match against
         * @return matcher
         */
        fun matchesJsonMap(json: String): JsonMatcher {
            return JsonMatcher(json)
        }
    }
}
