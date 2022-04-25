import com.moowork.gradle.node.npm.NpmTask
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "app"

val environment: String by project
val elideVersion: String by rootProject.extra


val buildEnv = if (!project.hasProperty("environment")) "development" else environment

plugins {
    id("org.springframework.boot") version "2.6.7"
    id("io.spring.dependency-management") version "1.0.11.RELEASE"
    kotlin("jvm")
    kotlin("plugin.spring") version "1.6.21"
    id("com.github.node-gradle.node") version "2.2.4"
}

node {
    version = "14.16.1"
    distBaseUrl = "https://nodejs.org/dist"
    download = true
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":models"))
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("com.yahoo.elide", "elide-spring-boot-starter", elideVersion)
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("com.h2database", "h2", "1.3.176")
    // drivers for models
    runtimeOnly("org.apache.hive","hive-jdbc","3.1.2"){
        exclude(group="org.apache.logging.log4j", module = "log4j-slf4j-impl")
        exclude(group="org.eclipse.jetty", module="jetty-runner")
    }
    runtimeOnly("com.facebook.presto","presto-jdbc","0.247")
    runtimeOnly("org.apache.calcite.avatica","avatica-core","1.17.0")
    runtimeOnly("mysql","mysql-connector-java","8.0.23")
    runtimeOnly("org.postgresql","postgresql","42.2.19")
    // drivers for models
    implementation( "org.hibernate", "hibernate-validator", "6.1.5.Final")
    implementation("io.micrometer","micrometer-core", "1.5.1")
    implementation("org.projectlombok", "lombok", "1.18.10")
    implementation("org.liquibase", "liquibase-core", "3.8.1")

    //Enables access logs.
    implementation("net.rakugakibox.spring.boot:logback-access-spring-boot-starter:2.9.0")
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }
    testImplementation("com.jayway.restassured", "rest-assured", "2.9.0")
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
    // set JVM arguments for the test JVM(s)
    jvmArgs ("-Xmx2048m")
}

tasks.withType<ProcessResources> {
    if(!"localElide".equals(System.getenv("APP_ENV"))) {
        dependsOn("copyNaviApp")
    }
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "1.8"
    }
}

tasks.register<NpmTask>("installUIDependencies") {
    setArgs(listOf("ci", "-verbose"))
    setExecOverrides(closureOf<ExecSpec> {
        setWorkingDir("../../../")
    })
}

tasks.register<NpmTask>("buildUI") {
  dependsOn("installUIDependencies")
  setEnvironment(mapOf("DISABLE_MOCKS" to true))
  setArgs(listOf("run-script", "build-ui","--environment=${buildEnv}"))
}

tasks.register<Copy>("copyNaviApp") {
    dependsOn("buildUI")
    from("../../app/dist")
    into("$buildDir/resources/main/META-INF/resources/ui")
}

tasks.register<Exec>("execJar") {
    dependsOn("bootJar")
    commandLine = listOf("java", "-jar", "build/libs/app-${project.version}.jar")
}
