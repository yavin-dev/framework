## Module Report

### Unknown Global

**Global**: `Ember.Inflector`

**Location**: `addon/components/favorite-item.js` at line 39

```js
  favoriteItems: computed('itemType', function() {
    let itemType = get(this, 'itemType'),
      pluralizedType = capitalize(Ember.Inflector.inflector.pluralize(itemType));

    return get(this, `user.favorite${pluralizedType}`);
```

### Unknown Global

**Global**: `Ember.__loader`

**Location**: `addon/helpers/delivery-rule-action.js` at line 15

```js
//Used to mark the returned action as an instance of a closure action
const CLOSURE_ACTION_MODULE =
  'ember-glimmer/helpers/action' in Ember.__loader.registry
    ? Ember.__loader.require('ember-glimmer/helpers/action')
    : {};
```

### Unknown Global

**Global**: `Ember.__loader`

**Location**: `addon/helpers/delivery-rule-action.js` at line 16

```js
const CLOSURE_ACTION_MODULE =
  'ember-glimmer/helpers/action' in Ember.__loader.registry
    ? Ember.__loader.require('ember-glimmer/helpers/action')
    : {};
```

### Unknown Global

**Global**: `Ember.__loader`

**Location**: `addon/helpers/item-action.js` at line 15

```js
//Used to mark the returned action as an instance of a closure action
const CLOSURE_ACTION_MODULE =
  'ember-glimmer/helpers/action' in Ember.__loader.registry
    ? Ember.__loader.require('ember-glimmer/helpers/action')
    : {};
```

### Unknown Global

**Global**: `Ember.__loader`

**Location**: `addon/helpers/item-action.js` at line 16

```js
const CLOSURE_ACTION_MODULE =
  'ember-glimmer/helpers/action' in Ember.__loader.registry
    ? Ember.__loader.require('ember-glimmer/helpers/action')
    : {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/print-report-test.js` at line 53

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/print-report-test.js` at line 54

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/print-report-test.js` at line 56

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/print-report-test.js` at line 57

```js
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

await visit('/print/reports/5');
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/print-report-test.js` at line 69

```js
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/print-report-test.js` at line 70

```js

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/report-collections-test.js` at line 34

```js
// Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/report-collections-test.js` at line 35

```js
// Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/report-collections-test.js` at line 36

```js
OriginalLoggerError = Ember.Logger.error;
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/report-collections-test.js` at line 37

```js
OriginalTestAdapterException = Ember.Test.adapter.exception;
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

server.get('/reportCollections/:id', { errors: ['The report-collections endpoint is down'] }, 500);
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/report-collections-test.js` at line 46

```js
    assert.notOk(!!findAll('.navi-collection').length, 'Navi report collection component is not rendered');

    Ember.Logger.error = OriginalLoggerError;
    Ember.Test.adapter.exception = OriginalTestAdapterException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/report-collections-test.js` at line 47

```js

    Ember.Logger.error = OriginalLoggerError;
    Ember.Test.adapter.exception = OriginalTestAdapterException;
  });

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1353

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1354

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1356

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1357

```js
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

await visit('/reports/invalidRoute');
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1370

```js
      );

      Ember.Logger.error = originalLoggerError;
      Ember.Test.adapter.exception = originalException;

```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1371

```js

      Ember.Logger.error = originalLoggerError;
      Ember.Test.adapter.exception = originalException;

  });
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1383

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1384

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1386

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1387

```js
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

await visit('/reports/5/view');
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1400

```js
      );

      Ember.Logger.error = originalLoggerError;
      Ember.Test.adapter.exception = originalException;

```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1401

```js

      Ember.Logger.error = originalLoggerError;
      Ember.Test.adapter.exception = originalException;

  });
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 425

```js
//suppress errors and exceptions for this test because 500 response will throw an error
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 426

```js
//suppress errors and exceptions for this test because 500 response will throw an error
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = () => {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 428

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = () => {};
Ember.Test.adapter.exception = () => {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 429

```js
Ember.Logger.error = () => {};
Ember.Test.adapter.exception = () => {};

server.get('/deliveryRules/:id', { errors: ['The deliveryRules endpoint is down'] }, 500);
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 469

```js
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 470

```js

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 477

```js
//suppress errors and exceptions for this test because 500 response will throw an error
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 478

```js
//suppress errors and exceptions for this test because 500 response will throw an error
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = () => {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 480

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = () => {};
Ember.Test.adapter.exception = () => {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 481

```js

    Ember.Logger.error = () => {};
    Ember.Test.adapter.exception = () => {};

    server.post('/deliveryRules', () => {
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 522

```js
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 523

```js

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
});
```

### Unknown Global

**Global**: `Ember.ActionHandler`

**Location**: `tests/unit/mixins/report-route-test.js` at line 10

```js
assert.expect(1);

let ReportRouteObject = EmberObject.extend(ReportRouteMixin, Ember.ActionHandler),
  subject = ReportRouteObject.create();
```
