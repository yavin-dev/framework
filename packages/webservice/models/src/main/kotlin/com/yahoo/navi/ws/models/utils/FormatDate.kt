package com.yahoo.navi.ws.models.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

class FormatDate {
    companion object {
        const val API_DATE_FORMAT: String =  "yyyy-MM-dd HH:mm:ss"
        val FORMATTER: SimpleDateFormat = SimpleDateFormat(API_DATE_FORMAT)

        init {
            FORMATTER.setTimeZone(TimeZone.getTimeZone("UTC"))
        }

        fun format(date: Date?): String? {
            if(date == null) {
                return null;
            }
            return FORMATTER.format(date);
        }

        @Throws(ParseException::class)
        fun parseDate(date: String?): Date? {
            if(date == null || date.isEmpty()) {
                return null;
            }

            return FORMATTER.parse(date);
        }
    }
}