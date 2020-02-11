# Navi Spring Boot Starter

1. Spring Boot Web
2. Spring Boot Elide Starter
3. Spring Boot Security Starter
4. Navi webserivce
5. Navi SPA
6. Yaml Configuration

##Configure

```yaml
elide:
  modelPackage: 'com.yahoo.navi.ws.models.beans'
  json-api:
    path: /json
    enabled: true
  graphql:
    path: /graphql
    enabled: false
  swagger:
    path: /doc
    enabled: false
    version: '1.0'

spring:
  main:
    allow-bean-definition-overriding: true

navi:
  appSettings:
    factApiHost: 'https://localhost:4443'
```
