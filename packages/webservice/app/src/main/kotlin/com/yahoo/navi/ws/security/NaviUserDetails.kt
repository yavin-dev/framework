/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms
 */

package com.yahoo.navi.ws.security

import com.yahoo.navi.ws.models.beans.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class NaviUserDetails(user: User) : UserDetails {

    private val user: User = user

    override fun getAuthorities(): Collection<GrantedAuthority> {
        val authorities = ArrayList<GrantedAuthority>()
        this.user.roles.forEach { role ->
            val authority = SimpleGrantedAuthority(role.id!!.toLowerCase())
            authorities.add(authority)
        }
        return authorities
    }

    override fun getPassword(): String {
        return ""
    }

    override fun getUsername(): String {
        return this.user.id!!
    }

    override fun isEnabled(): Boolean {
        return true
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }
}
