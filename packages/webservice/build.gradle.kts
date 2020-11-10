import groovy.json.JsonSlurper

fun readVersion(): String {
    val inputFile = File("${project.projectDir}/../../package.json")
    val json = JsonSlurper().parseText(inputFile.readText()) as Map<*, *>
    return json["version"] as String
}
val parentVersion = readVersion()

allprojects {
    group = "com.yahoo.navi"
    description = "The persistence webservice for navi application data"
    version = parentVersion
}

buildscript {
    repositories {
        mavenCentral()
        maven {
            url = uri("https://plugins.gradle.org/m2/")
        }
    }

    dependencies {
        classpath(kotlin("gradle-plugin", version = "1.3.72"))
        classpath("org.jmailen.gradle:kotlinter-gradle:2.4.1")
    }
}

plugins {
    java
    base
    kotlin("jvm") version "1.3.72" apply false
    id("org.jmailen.kotlinter") version "2.4.1"
    id("org.liquibase.gradle") version "2.0.3"
}

subprojects {
    apply(plugin = "java")
    apply(plugin = "org.jmailen.kotlinter")

    repositories {
        jcenter()
        mavenLocal()
        maven(url = "https://repo.maven.apache.org/maven2")
    }

    dependencies {
        implementation(kotlin("stdlib-jdk8", "1.3.72"))
        implementation("com.fasterxml.jackson.core:jackson-databind") {
            version {
                strictly("2.10.1")
            }
        }
        implementation("org.liquibase:liquibase-core") {
            version {
                strictly("3.8.1")
            }
        }
    }
}
