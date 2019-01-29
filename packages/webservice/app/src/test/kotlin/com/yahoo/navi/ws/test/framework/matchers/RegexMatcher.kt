package com.yahoo.navi.ws.test.framework.matchers

import org.hamcrest.Description
import org.hamcrest.TypeSafeMatcher

/**
 * Checks whether a string matches a regex
 */
class RegexMatcher(private val regex: String) : TypeSafeMatcher<String>() {

    /**
     * {@inheritDoc}
     */
    override fun describeTo(description: Description) {
        description.appendText("matches regex=`$regex`")
    }

    /**
     * {@inheritDoc}
     */
    public override fun matchesSafely(string: String): Boolean {
        return string.matches(regex.toRegex())
    }

    companion object {

        /**
         * Helper for making RegexMatcher
         * @param regex expression to match against
         * @return matcher
         */
        fun matchesRegex(regex: String): RegexMatcher {
            return RegexMatcher(regex)
        }
    }
}
