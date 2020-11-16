import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import com.github.jengelman.gradle.plugins.shadow.transformers.PropertiesFileTransformer
import com.moowork.gradle.node.npm.NpmTask
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile


description = "app"

plugins {
    id("org.springframework.boot") version "2.3.1.RELEASE"
    id("io.spring.dependency-management") version "1.0.9.RELEASE"
    id("com.github.johnrengelman.shadow") version "5.2.0"
    kotlin("jvm")
    kotlin("plugin.spring") version "1.3.72"
    id("com.github.node-gradle.node") version "2.2.4"
    id("org.liquibase.gradle") version "2.0.4"
}

node {
    version = "12.16.0"
    distBaseUrl = "https://nodejs.org/dist"
    download = true
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":models"))
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("com.yahoo.elide", "elide-spring-boot-starter", "5.0.0-pr24")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("com.h2database", "h2", "1.4.199")
    implementation( "org.hibernate", "hibernate-validator", "6.1.5.Final")
    implementation("io.micrometer","micrometer-core", "1.5.1")
    implementation("org.projectlombok", "lombok", "1.18.10")
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }
    testImplementation("com.jayway.restassured", "rest-assured", "2.9.0")
    implementation("org.liquibase:liquibase-core") {
        version {
            strictly("3.8.1")
        }
    }
    implementation("com.h2database","h2","1.4.197")
    add("liquibaseRuntime","com.h2database:h2:1.4.197")
    add( "liquibaseRuntime", "org.liquibase:liquibase-core:3.4.1")
    add("liquibaseRuntime", "org.liquibase:liquibase-gradle-plugin:2.0.4")
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
}

tasks.withType<ProcessResources> {
    dependsOn("copyNaviApp")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "1.8"
    }
}

tasks.register<NpmTask>("installUIDependencies") {
    setArgs(listOf("ci"))
    setExecOverrides(closureOf<ExecSpec> {
        setWorkingDir("../../../")
    })
}

tasks.register<NpmTask>("buildUI") {
  dependsOn("installUIDependencies")
  dependsOn("update")
  setEnvironment(mapOf("DISABLE_MOCKS" to true))
  setArgs(listOf("run-script", "build-ui"))
}

tasks.register<Copy>("copyNaviApp") {
    dependsOn("buildUI")
    from("../../app/dist")
    into("$buildDir/resources/main/META-INF/resources/ui")
}

tasks.withType<ShadowJar> {
    classifier = ""

    // Required for Spring
    mergeServiceFiles()
    append("META-INF/spring.handlers")
    append("META-INF/spring.schemas")
    transform(PropertiesFileTransformer().apply {
        paths = listOf("META-INF/spring.factories")
        mergeStrategy = "append"
    })
    manifest {
        attributes["Main-Class"] = "com.yahoo.navi.ws.AppKt"
    }
}

tasks.register<Exec>("execJar") {
    dependsOn("shadowJar")
    commandLine = listOf("java", "-jar", "build/libs/app-${project.version}.jar")
}

liquibase {
    activities.register("main") {
        this.arguments = mapOf(
                "logLevel" to "debug",
                "changeLogFile" to "src/main/resources/db/changelog/changelog-demo.xml",
                "url" to "jdbc:h2:file:/tmp/demoDB;DB_CLOSE_DELAY=-1",
                "username" to "guest")
    }
}
