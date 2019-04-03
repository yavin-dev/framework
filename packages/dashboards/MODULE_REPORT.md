## Module Report

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/dashboard-collections-test.js` at line 37

```js
// Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/dashboard-collections-test.js` at line 38

```js
// Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/dashboard-collections-test.js` at line 39

```js
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/dashboard-collections-test.js` at line 40

```js
    OriginalTestAdapterException = Ember.Test.adapter.exception;
    Ember.Logger.error = function() {};
    Ember.Test.adapter.exception = function() {};

    server.get('/dashboardCollections/:id', () => {
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/dashboard-collections-test.js` at line 51

```js
    assert.notOk(!!findAll('.navi-collection').length, 'Navi dashboard collection component is not rendered');

    Ember.Logger.error = OriginalLoggerError;
    Ember.Test.adapter.exception = OriginalTestAdapterException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/dashboard-collections-test.js` at line 52

```js
    Ember.Logger.error = OriginalLoggerError;
    Ember.Test.adapter.exception = OriginalTestAdapterException;
  });
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/dashboards-test.js` at line 40

```js
// Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/dashboards-test.js` at line 41

```js
// Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/dashboards-test.js` at line 42

```js
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/dashboards-test.js` at line 43

```js
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

this.urlPrefix = config.navi.appPersistence.uri;
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/dashboards-test.js` at line 56

```js
      assert.notOk(!!find('.navi-dashboard').length, 'Navi dashboard collection component is not rendered');

      Ember.Logger.error = OriginalLoggerError;
      Ember.Test.adapter.exception = OriginalTestAdapterException;
    });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/dashboards-test.js` at line 57

```js
      Ember.Logger.error = OriginalLoggerError;
      Ember.Test.adapter.exception = OriginalTestAdapterException;
    });
  });
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/dashboards-test.js` at line 549

```js
assert.expect(2);
// Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/dashboards-test.js` at line 550

```js
// Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/dashboards-test.js` at line 551

```js
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/dashboards-test.js` at line 552

```js
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/dashboards-test.js` at line 571

```js
      );

      Ember.Logger.error = OriginalLoggerError;
      Ember.Test.adapter.exception = OriginalTestAdapterException;
    });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/dashboards-test.js` at line 572

```js
      Ember.Logger.error = OriginalLoggerError;
      Ember.Test.adapter.exception = OriginalTestAdapterException;
    });
  });
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/explore-widget-test.js` at line 318

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/explore-widget-test.js` at line 319

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/explore-widget-test.js` at line 321

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/explore-widget-test.js` at line 322

```js
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

await visit('/dashboards/2/widgets/4/view');
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/explore-widget-test.js` at line 334

```js
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/explore-widget-test.js` at line 335

```js
    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.ActionHandler`

**Location**: `tests/unit/mixins/routes/report-to-widget-test.js` at line 23

```js
        }
      },
      RouteObject = EmberObject.extend(ReportToWidgetMixin, Ember.ActionHandler, {
        /* == Mock Data == */
        modelFor: () => reportModel,
```

### Unknown Global

**Global**: `Ember.ActionHandler`

**Location**: `tests/unit/mixins/routes/report-to-widget-test.js` at line 68

```js
        }
      },
      RouteObject = EmberObject.extend(ReportToWidgetMixin, Ember.ActionHandler, {
        /* == Mock Data == */
        modelFor: () => reportModel,
```
