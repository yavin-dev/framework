import com.jfrog.bintray.gradle.BintrayExtension
import org.jfrog.gradle.plugin.artifactory.dsl.DoubleDelegateWrapper
import org.jfrog.gradle.plugin.artifactory.dsl.PublisherConfig
import org.jfrog.gradle.plugin.artifactory.task.ArtifactoryTask

description = "The models required to be stored for the webservice"

plugins {
    base
    kotlin("jvm")
    `maven-publish`
    id("com.jfrog.bintray") version "1.8.5"
    id("com.jfrog.artifactory") version "4.16.1"
    kotlin("plugin.allopen") version "1.3.72"
    kotlin("plugin.jpa") version "1.3.72"
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
    implementation("com.yahoo.elide", "elide-core", "5.0.0-pr23")
    implementation("com.yahoo.elide", "elide-datastore-aggregation", "5.0.0-pr23")
    implementation("javax.persistence", "javax.persistence-api", "2.2")
    implementation("org.hibernate", "hibernate-core", "5.4.15.Final")
    implementation("org.projectlombok", "lombok", "1.18.12")
}

val sourcesJar by tasks.registering(Jar::class) {
    dependsOn(JavaPlugin.CLASSES_TASK_NAME)
    archiveClassifier.set("sources")
    from(sourceSets.main.get().allSource)
}

artifacts.add("archives", sourcesJar)

publishing {
    publications {
        create<MavenPublication>("models") {
            from(components["java"])
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
            }
        }
    }

}

gradle.taskGraph.whenReady {
    if (hasTask(":models:artifactoryPublish")) {
        var tag = ""
        if(project.hasProperty("publishTag")) {
            tag = "-${project.property("publishTag")}"
        }
        version = "${version}${tag}-SNAPSHOT"
        println("Overriding version as $version for artifactory")
    }
}

// Config for snapshot deploys
artifactory {
    setContextUrl("https://oss.jfrog.org")

    publish(closureOf<PublisherConfig> {
        repository(closureOf<DoubleDelegateWrapper> {
            this.invokeMethod("setRepoKey", "oss-snapshot-local")
            this.invokeMethod("setUsername", System.getenv("ARTIFACTORY_USER"))
            this.invokeMethod("setPassword", System.getenv("ARTIFACTORY_KEY"))
        })
        defaults(closureOf<ArtifactoryTask> {
            publications("models")
        })
    })
}

// Config for bintray deploy
bintray {
    user = System.getenv("BINTRAY_USER")
    key = System.getenv("BINTRAY_KEY")
    publish = true
    setPublications("models")
    pkg(closureOf<BintrayExtension.PackageConfig> {
        repo = "maven"
        name = "navi"
        userOrg = "yahoo"
        desc = "Navi is a production quality analytics reporting UI with out of the box support for Fili."
        websiteUrl = "https://github.com/yahoo/navi/tree/master/packages/webservice"
        issueTrackerUrl = "https://github.com/yahoo/navi/issues"
        vcsUrl = "https://github.com/yahoo/navi.git"
        setLabels("navi", "reports", "dashboards", "visualizations", "elide", "webservice")
        setLicenses("MIT")
    })
}
