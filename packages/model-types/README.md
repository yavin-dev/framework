# @yavin/model-types

Contains the TypeScript definitions for the following json:api objects stored in the webservice package

`Dashboard`, `DashboardWidget`, `Report`, `DeliveryRule`, `User`, `Role`

## Examples

You'll need to cast your responses using the `JSONAPI<RequestedObject, IncludedType>` type with the models you are requesting

```ts
import type { Dashboard, DashboardWidget, JSONAPI } from '@yavin/model-types';

const response = await fetch('yavin.webservice/api/v1/dashboards/12?include=widgets');

const jsonApi = (await response.json()) as JSONAPI<Dashboard, DashboardWidget>;

//now typed
jsonApi.data.attributes.presentation.layout[0].widgetId;
jsonApi.included[0].type === 'dashboardWidgets';
jsonApi.included[0].attributes.requests[0];
```

Here are more examples of fetching resources and how to type the response

| fetch('\*')                            | Response Type                              |
| -------------------------------------- | ------------------------------------------ |
| /reports                               | JSONAPI<Report[]>                          |
| /report/12                             | JSONAPI\<Report>                           |
| /report/12?include=owner               | JSONAPI<Report, User>                      |
| /dashboards/13?include=widgets         | JSONAPI<Dashboard, DashboardWidget>        |
| /deliveryRules/3?include=deliveredItem | JSONAPI<DeliveryRule, Report \| Dashboard> |
