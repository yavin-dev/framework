# navi-webservice

The webservice that powers navi's persistence

# Installation

Latest models release: [ ![Download](https://api.bintray.com/packages/yahoo/maven/navi/images/download.svg) ](https://bintray.com/yahoo/maven/navi/_latestVersion)

We provide a collection of models to use with [Elide](https://github.com/yahoo/elide) (check out the [demo app](./app) for usage)

<details open=true><summary>Gradle</summary>

```
compile 'com.yahoo.navi:models:0.2.0'
```

</details>

<details><summary>Maven</summary>

```xml
<dependency>
  <groupId>com.yahoo.navi</groupId>
  <artifactId>models</artifactId>
  <version>0.2.0</version>
  <type>pom</type>
</dependency>
```

</details>

---

You can also try the latest builds using the `0.2.0-SNAPSHOT` version by adding the snapshot repo

_build.gradle.kts_

```
repositories {
    maven {
        url = uri("https://oss.jfrog.org/artifactory/oss-snapshot-local")
    }
}
```

# Running

To run the demo app

```shell script
$ ./gradlew run
```

# License

This project is licensed under the [MIT License](LICENSE.md)
