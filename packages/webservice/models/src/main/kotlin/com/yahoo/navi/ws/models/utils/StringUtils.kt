package com.yahoo.navi.ws.models.utils

fun singularize(value: String): String {
    if(value.endsWith("es")) {
        return value.dropLast(2)
    } else if(value.endsWith("s")) {
        return value.dropLast(1)
    }
    return value
}