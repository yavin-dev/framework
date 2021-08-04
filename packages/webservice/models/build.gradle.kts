description = "The models required to be stored for the webservice"

plugins {
    base
    kotlin("jvm")
    `maven-publish`
    kotlin("plugin.allopen") version "1.3.72"
    kotlin("plugin.jpa") version "1.3.72"
    `signing`
}

java {
    sourceSets {
        getByName("main").java.setSrcDirs(arrayListOf("src/main/kotlin"))
        getByName("test").java.setSrcDirs(arrayListOf("src/test/kotlin"))
    }
}

allOpen {
    annotation("javax.persistence.Entity")
    annotation("javax.persistence.Embeddable")
    annotation("javax.persistence.MappedSuperclass")
}

dependencies {
    implementation("com.yahoo.elide", "elide-core", "5.0.6")
    implementation("javax.persistence", "javax.persistence-api", "2.2")
    implementation("org.hibernate", "hibernate-core", "5.4.15.Final")
    implementation("jakarta.mail:jakarta.mail-api:1.6.7")
}

val sourcesJar by tasks.registering(Jar::class) {
    dependsOn(JavaPlugin.CLASSES_TASK_NAME)
    archiveClassifier.set("sources")
    from(sourceSets.main.get().allSource)
}

artifacts.add("archives", sourcesJar)

group = "dev.yavin"

publishing {
    publications {
        create<MavenPublication>("mavenJava") {
            artifactId = "models"
            from(components["java"])
            versionMapping {
                usage("java-api") {
                    fromResolutionOf("runtimeClasspath")
                }
                usage("java-runtime") {
                    fromResolutionResult()
                }
            }
            pom {
                name.set("Navi: Webservice models")
                description.set(project.description)
                url.set("https://github.com/yahoo/navi/tree/master/packages/webservice")
                licenses {
                    license {
                        name.set("MIT License")
                        url.set("http://www.opensource.org/licenses/mit-license.php")
                        distribution.set("repo")
                    }
                }
                developers {
                    developer {
                        email.set("team-navi@googlegroups.com")
                    }
                }
                scm {
                    connection.set("scm:git:https://github.com/yavin-dev/framework.git")
                    developerConnection.set("scm:git:ssh:git@github.com:yavin-dev/framework.git")
                    url.set("http://yavin.dev")
                }
            }
        }
    }
    repositories {
        maven {
            val releasesRepoUrl = uri("https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/")
            val snapshotsRepoUrl = uri("https://s01.oss.sonatype.org/content/repositories/snapshots/")
            // This line is evaluated before gradle.taskGraph.whenReady so the version did not contain "SNAPSHOT" in name,
            // so it was using releaseUrl instead of snapshotUrl. isSnapshot is passed in as project property in maven-publish.sh.
            url = if (project.hasProperty("isSnapshot") && project.property("isSnapshot").toString().equals("true")) snapshotsRepoUrl else releasesRepoUrl
            credentials {
                username = System.getenv("OSSRH_USER") as String?
                password = System.getenv("OSSRH_TOKEN") as String?

            }
        }
    }
}

project.setProperty("signing.password", System.getenv("GPG_PASSPHRASE"))

signing {
    sign(publishing.publications["mavenJava"])
}

gradle.taskGraph.whenReady {
    if (hasTask(":models:publish")) {
        var tag = ""
        if(project.hasProperty("publishTag")) {
            tag = "-${project.property("publishTag")}"
        }
        var snapshot = ""
        if(project.hasProperty("isSnapshot") && project.property("isSnapshot").toString().equals("true")) {
            snapshot = "-SNAPSHOT"
        }
        version = "${version}${tag}${snapshot}"
        println("Overriding version as $version for maven")
    }
}
