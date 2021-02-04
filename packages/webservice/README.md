# navi-webservice

The webservice that powers navi's persistence

We provide a collection of models to use with [Elide](https://github.com/yahoo/elide) (check out the [demo app](./app) for usage)

# Installation [ ![Download](https://api.bintray.com/packages/yahoo/maven/navi/images/download.svg) ](https://bintray.com/yahoo/maven/navi/_latestVersion)

_You can also try the latest builds with `0.2.0-SNAPSHOT` version_

<details open=true><summary><strong>Gradle</strong></summary>

```
repositories {
    jcenter()
}
```

```
dependencies {
    implementation("com.yahoo.navi:models:0.2.0")
}
```

<blockquote><details><summary>Snapshot build</summary>

```
repositories {
    maven {
        url "https://oss.jfrog.org/artifactory/oss-snapshot-local"
    }
}
```

```
dependencies {
    implementation("com.yahoo.navi:models:0.2.0-SNAPSHOT")
}
```

</details></blockquote>
</details>

<details><summary><strong>Maven</strong></summary>

```xml
<repositories>
    <repository>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
        <id>central</id>
        <name>bintray</name>
        <url>https://jcenter.bintray.com</url>
    </repository>
</repositories>
```

```xml
<dependencies>
    <dependency>
      <groupId>com.yahoo.navi</groupId>
      <artifactId>models</artifactId>
      <version>0.2.0</version>
    </dependency>
</dependencies>
```

<blockquote><details><summary>Snapshot build</summary>

```xml
<repositories>
    <repository>
        <id>oss-snapshot-local</id>
        <name>oss-snapshot-local</name>
        <url>https://oss.jfrog.org/artifactory/oss-snapshot-local</url>
    </repository>
</repositories>
```

```xml
<dependencies>
    <dependency>
      <groupId>com.yahoo.navi</groupId>
      <artifactId>models</artifactId>
      <version>0.2.0-SNAPSHOT</version>
    </dependency>
</dependencies>
```

</details></blockquote>
</details>

# Running

To run the demo app

```shell script
$ ./gradlew bootRun -Pbuild_env=prod
```

Build for dev environment

```shell script
$ ./gradlew bootRun
```

To run as Jar file

```shell script
$ ./gradlew execJar
```

# License

This project is licensed under the [MIT License](LICENSE.md)
