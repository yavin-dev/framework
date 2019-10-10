import com.jfrog.bintray.gradle.BintrayExtension

description = "The models required to be stored for the webservice"

plugins {
    base
    kotlin("jvm")
    `maven-publish`
    id("com.jfrog.bintray") version "1.8.4"
}

java {
    sourceSets {
        getByName("main").java.setSrcDirs(arrayListOf("src/main/kotlin"))
        getByName("test").java.setSrcDirs(arrayListOf("src/test/kotlin"))
    }
}

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

    bintray {
        user = System.getenv("BINTRAY_USER")
        key = System.getenv("BINTRAY_KEY")
        publish = true
        setPublications("models")
        pkg(delegateClosureOf<BintrayExtension.PackageConfig> {
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
}