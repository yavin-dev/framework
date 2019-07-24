/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.types

import com.fasterxml.jackson.core.JsonParseException
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import org.hibernate.HibernateException
import org.hibernate.engine.spi.SharedSessionContractImplementor
import org.hibernate.usertype.ParameterizedType
import org.hibernate.usertype.UserType
import java.io.IOException
import java.io.Serializable
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.Types
import java.util.Objects
import java.util.Properties

class JsonType : UserType, ParameterizedType {
    private var objectClass: Class<*>? = null

    override fun sqlTypes(): IntArray {
        return intArrayOf(Types.LONGVARCHAR)
    }

    override fun returnedClass(): Class<*> {
        return String::class.java
    }

    override fun equals(firstObject: Any?, secondObject: Any?): Boolean {
        return Objects.equals(firstObject, secondObject)
    }

    override fun hashCode(obj: Any?): Int {
        return Objects.hashCode(obj)
    }

    override fun nullSafeGet(resultSet: ResultSet?, names: Array<out String>?, session: SharedSessionContractImplementor, obj: Any?): Any? {
        if(resultSet!!.getString(names!![0]) != null) {
            val rawJson = resultSet.getString(names[0])
            try {
                val mapper = ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                return mapper.readValue(rawJson, this.objectClass)
            } catch (e: IOException) {
                throw HibernateException("Could not retrieve an instance of the mapped class from a JDBC resultset.")
            }
        }
        return null
    }

    override fun nullSafeSet(stmt: PreparedStatement?, value: Any?, index: Int, session: SharedSessionContractImplementor?) {
        if(value == null) {
            stmt!!.setNull(index, Types.NULL)
        } else {
            val mapper = ObjectMapper()
            try {
                val json = mapper.writeValueAsString(value)
                stmt!!.setString(index, json)
            } catch (e: JsonParseException) {
                throw HibernateException("Could not write an instance of the mapped class to a prepared statement.")
            }
        }
    }

    override fun deepCopy(obj: Any?): Any? {
        return obj // since mutable is false return the object
    }

    override fun isMutable(): Boolean {
        return false
    }

    override fun disassemble(value: Any?): Serializable? {
        return if (value == null) null else deepCopy(value) as Serializable
    }

    override fun assemble(cached: Serializable?, owner: Any?): Any? {
        return if (cached == null) null else deepCopy(cached)
    }

    override fun replace(original: Any?, target: Any?, owner: Any?): Any? {
        return deepCopy(original)
    }

    override fun setParameterValues(properties: Properties?) {
        try {
            this.objectClass = Class.forName(properties!!.getProperty("class"))
        } catch (e: ClassNotFoundException) {
            throw RuntimeException("Unable set the `class` parameter for serialization/deserialization: " + properties!!.getProperty("class"), e)
        }
    }
}