import de.undercouch.gradle.tasks.download.Download

description = "app"

plugins {
    base
    kotlin("jvm")
    application
    id("de.undercouch.download")
    id("com.github.johnrengelman.shadow") version "5.1.0"
}

application {
    mainClassName = "com.yahoo.navi.ws.app.MainKt"
}

dependencies {
    implementation(project(":models"))
    implementation("com.h2database", "h2", "1.3.176")
    implementation("org.webjars", "swagger-ui", "3.10.0")
}

java {
    sourceSets {
        getByName("main").java.setSrcDirs(arrayListOf("src/main/kotlin"))
        getByName("main").resources.srcDir("src/main/resources")
        getByName("test").java.setSrcDirs(arrayListOf("src/test/kotlin"))
    }
}

tasks.withType<Jar> {
    manifest {
        attributes["Main-Class"] = application.mainClassName
    }
}

// Custom download task to bundle swagger ui
val downloadSwagger by tasks.registering(Download::class) {
    src("https://github.com/swagger-api/swagger-ui/archive/master.zip")
    dest(File(buildDir, "swagger-ui-master.zip"))
    overwrite(false)
}

// unzips swagger ui
val unzipSwagger by tasks.registering(Copy::class) {
    from(zipTree(downloadSwagger.get().dest))
    into(buildDir)
    dependsOn("downloadSwagger")
}

// copies swagger ui into resources
val importSwaggerUI by tasks.registering(Copy::class) {
    from("$buildDir/swagger-ui-master/dist")
    into("$buildDir/resources/main/swagger-ui/")
    exclude("index.html")
    dependsOn("unzipSwagger")
}

tasks.getByName("processResources").dependsOn("importSwaggerUI")