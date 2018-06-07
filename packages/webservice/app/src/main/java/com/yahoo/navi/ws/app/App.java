package com.yahoo.navi.ws.app;

import com.yahoo.elide.standalone.ElideStandalone;

public class App 
{
    public static void main( String[] args ) throws Exception
    {
        ElideStandalone app = new ElideStandalone(new Settings());
        app.start();
    }
}
