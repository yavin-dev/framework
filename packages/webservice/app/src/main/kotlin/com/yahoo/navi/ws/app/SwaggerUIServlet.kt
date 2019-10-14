/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.ws.app

import java.net.URLConnection
import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * Custom servlet to load /swagger-ui/ from the buildDir resources or bundled jar resources
 */
class SwaggerUIServlet : HttpServlet() {
    override fun doGet(req: HttpServletRequest?, resp: HttpServletResponse?) {
        if (req == null || resp == null) {
            System.err.println("No request or response")
            return
        }

        val fileNameIndex = req.requestURI.lastIndexOf('/')

        if (req.requestURI == "/swagger-ui/" || fileNameIndex == -1) {
            resp.sendRedirect("/swagger-ui/index.html")
            return
        }

        val fileName = req.requestURI.substring(fileNameIndex + 1)

        val contentType = when (fileName.substring(fileName.lastIndexOf(".") + 1)) {
            "js" -> "application/javascript"
            "css" -> "text/css"
            else -> URLConnection.guessContentTypeFromName(fileName)
        }

        resp.contentType = contentType
        resp.status = HttpServletResponse.SC_OK
        val resourceAsStream = javaClass.getResourceAsStream(req.requestURI)
        resourceAsStream.copyTo(resp.outputStream)
    }
}