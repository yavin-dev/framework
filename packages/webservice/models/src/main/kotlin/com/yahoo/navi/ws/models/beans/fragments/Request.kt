/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.fragments

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "requestVersion")
@JsonSubTypes(
    JsonSubTypes.Type(value = RequestV1::class, name = "v1"),
    JsonSubTypes.Type(value = RequestV2::class, name = "2.0"))
interface Request