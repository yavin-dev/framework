/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

package com.yahoo.navi.ws.filters

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.stereotype.Component
import java.security.Principal
import javax.servlet.Filter
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletRequestWrapper

@Component
class AuthFilter(private val userDetailsService: UserDetailsService) : Filter {
    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        val user = (request as HttpServletRequest).getHeader("User") ?: "admin"
        var authorities: Collection<GrantedAuthority>
        if (user !== null) {
            authorities = try {
                val userDetails = userDetailsService.loadUserByUsername(user)
                userDetails.authorities
            } catch (e: UsernameNotFoundException) {
                ArrayList<GrantedAuthority>()
            }
        } else {
            authorities = ArrayList<GrantedAuthority>()
        }

        chain.run {
            doFilter(
                object : HttpServletRequestWrapper(request) {
                    override fun getUserPrincipal(): Principal {
                        return PreAuthenticatedAuthenticationToken(Principal { user }, null, authorities)
                    }
                },
                response
            )
        }
    }
}
