import groovy.json.JsonSlurper

fun readVersion(): String {
    val inputFile = File("${project.projectDir}/../../package.json")
    val json = JsonSlurper().parseText(inputFile.readText()) as Map<*, *>
    return json["version"] as String
}
val parentVersion = readVersion()

val elideVersion by extra { "6.1.5" }

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
        classpath(kotlin("gradle-plugin", version = "1.4.31"))
        classpath("org.jmailen.gradle:kotlinter-gradle:3.3.0")
    }
}

plugins {
    java
    base
    kotlin("jvm") version "1.4.31" apply false
}

subprojects {
    apply(plugin = "java")
    apply(plugin = "org.jmailen.kotlinter")

    repositories {
        mavenLocal()
        maven(url = "https://repo.maven.apache.org/maven2")
    }

    dependencies {
        implementation(kotlin("stdlib-jdk8", "1.4.31"))
        implementation("com.fasterxml.jackson.core:jackson-databind") {
            version {
                strictly("2.10.1")
            }
        }
    }
}
