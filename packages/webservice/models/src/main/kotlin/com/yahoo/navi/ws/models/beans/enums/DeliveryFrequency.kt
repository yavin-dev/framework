/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.models.beans.enums

enum class DeliveryFrequency(val id: Int) {
    minute(2),
    hour(3),
    day(4),
    week(5),
    month(6),
    quarter(7);
}
