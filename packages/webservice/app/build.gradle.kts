description = "app"

plugins {
    base
    kotlin("jvm")
    application
}

application {
    mainClassName = "com.yahoo.navi.ws.app.MainKt"
}

dependencies {
    implementation(project(":models"))
    implementation("com.h2database", "h2", "1.3.176")
    testImplementation("com.jayway.restassured", "rest-assured", "2.9.0")
}

java {
    sourceSets {
        getByName("main").java.setSrcDirs(arrayListOf("src/main/kotlin"))
        getByName("main").resources.srcDir("src/main/resources")
        getByName("test").java.setSrcDirs(arrayListOf("src/test/kotlin"))
    }
}
