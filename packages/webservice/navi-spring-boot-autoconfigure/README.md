#Navi Spring Autoconfigure

Navi Spring Autoconfigure gives you what you need to run an asset server in spring boot 2.

1. SPA MVC controller to route URIs to index.html
2. Configure endpoint to push configuration into navi.
3. Navi webservice json-api endpoint

Provide your own Spring Security setup.

Need the following option enabled:

`spring.main.allow-bean-definition-overriding: true`

##Configuration Properties

| _Property_                            | _Required_ | _Default_ | _Description_                          |
| ------------------------------------- | ---------- | --------- | -------------------------------------- |
| navi.appSettings.factApiHost          | yes        | ""        | Fili data endpoint                     |
| navi.appSettings.persistenceApiHost   | no         | "/json"   | Navi Webservice endpoint               |
| navi.FEATURES.enableDashboardsFilters | no         | true      | Enable global dashboard filters        |
| navi.FEATURES.enableTotals            | no         | true      | Enable client side table total feature |
| navi.FEATURES.enableTableEditing      | no         | true      | Allow table editing features           |

see: https://github.com/yahoo/elide/blob/master/elide-spring/elide-spring-boot-autoconfigure/README.md
