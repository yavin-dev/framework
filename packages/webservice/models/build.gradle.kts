description = "models"

plugins {
    base
    kotlin("jvm")
}

java {
    sourceSets {
        getByName("main").java.setSrcDirs(arrayListOf("src/main/kotlin"))
        getByName("test").java.setSrcDirs(arrayListOf("src/test/kotlin"))
    }
}
