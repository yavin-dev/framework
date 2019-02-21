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
        classpath(kotlin("gradle-plugin", version = "1.3.20"))
    }
}

plugins {
    java
    base
    kotlin("jvm") version "1.3.10" apply false
}

subprojects {
    apply(plugin = "java")

    repositories {
        jcenter()
        mavenLocal()
        maven(url = "http://repo.maven.apache.org/maven2")
    }

    dependencies {
        implementation(kotlin("stdlib", "1.3.10"))
        implementation("com.yahoo.elide", "elide-standalone", "4.2.7")
        implementation("org.slf4j", "slf4j-api", "1.7.25")
        implementation("org.hibernate", "hibernate-validator", "4.0.2.GA")
        testImplementation(kotlin("test"))
        testImplementation(kotlin("test-junit"))
    }

}