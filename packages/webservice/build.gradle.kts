allprojects {
    group = "com.yahoo.navi.ws"
    description = "webservice"
    version = "1.0-SNAPSHOT"
}

buildscript {
    repositories {
        mavenCentral()
    }

    dependencies {
        classpath(kotlin("gradle-plugin", version = "1.3.31"))
    }
}

plugins {
    java
    base
    kotlin("jvm") version "1.3.31" apply false
}

subprojects {
    apply(plugin = "java")

    repositories {
        jcenter()
        mavenLocal()
        maven(url = "http://repo.maven.apache.org/maven2")
    }

    dependencies {
        implementation(kotlin("stdlib-jdk8", "1.3.31"))
        implementation("com.yahoo.elide", "elide-standalone", "4.4.4")
        implementation("org.slf4j", "slf4j-api", "1.7.25")
        implementation("ch.qos.logback", "logback-core", "1.2.3")
        implementation("org.hibernate", "hibernate-validator", "4.0.2.GA")
        testImplementation(kotlin("test"))
        testImplementation(kotlin("test-junit"))
        testImplementation("org.mockito", "mockito-core", "2.23.4")
        testImplementation("com.jayway.restassured", "rest-assured", "2.9.0")
    }

}