dependencies {
    val springBootVersion = "2.2.4.RELEASE";
    implementation("org.springframework.boot:spring-boot-starter-web:${springBootVersion}")
    implementation("org.springframework.boot:spring-boot-starter-security:${springBootVersion}")
    implementation("com.yahoo.elide:elide-spring-boot-starter:5.0.0-pr5")
    implementation(project(":navi-spring-boot-autoconfigure"))
    implementation("org.yaml:snakeyaml:1.25")
}