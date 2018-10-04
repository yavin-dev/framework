package com.yahoo.navi.ws.models.beans.enums

enum class DeliveryFrequency private constructor(private val id: Int) {
    day(4),
    week(5),
    month(6),
    quarter(7)
}