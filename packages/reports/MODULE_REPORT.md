## Module Report

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

**Global**: `Ember.Inflector`

**Location**: `addon/components/favorite-item.js` at line 39

```js
  favoriteItems: computed('itemType', function() {
    let itemType = get(this, 'itemType'),
      pluralizedType = capitalize(Ember.Inflector.inflector.pluralize(itemType));

    return get(this, `user.favorite${pluralizedType}`);
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

**Location**: `tests/acceptance/print-report-test.js` at line 47

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/print-report-test.js` at line 48

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/print-report-test.js` at line 50

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/print-report-test.js` at line 51

```js
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

await visit('/print/reports/5');
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/print-report-test.js` at line 62

```js
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/print-report-test.js` at line 63

```js

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1291

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1292

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1294

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1295

```js
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

await visit('/reports/invalidRoute');
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1307

```js
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1308

```js

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1319

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1320

```js
//suppress errors and exceptions for this test
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1322

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1323

```js
Ember.Logger.error = function() {};
Ember.Test.adapter.exception = function() {};

await visit('/reports/5/view');
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/navi-report-test.js` at line 1335

```js
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/navi-report-test.js` at line 1336

```js

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 356

```js
//suppress errors and exceptions for this test because 500 response will throw an error
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 357

```js
//suppress errors and exceptions for this test because 500 response will throw an error
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = () => {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 359

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = () => {};
Ember.Test.adapter.exception = () => {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 360

```js
Ember.Logger.error = () => {};
Ember.Test.adapter.exception = () => {};

server.get('/deliveryRules/:id', { errors: ['The deliveryRules endpoint is down'] }, 500);
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 401

```js
      .isVisible('The cancel button is the primary button on the modal when there is an error fetching the schedule');

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 402

```js

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 409

```js
//suppress errors and exceptions for this test because 500 response will throw an error
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 410

```js
//suppress errors and exceptions for this test because 500 response will throw an error
let originalLoggerError = Ember.Logger.error,
  originalException = Ember.Test.adapter.exception;

Ember.Logger.error = () => {};
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 412

```js
originalException = Ember.Test.adapter.exception;

Ember.Logger.error = () => {};
Ember.Test.adapter.exception = () => {};
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 413

```js

    Ember.Logger.error = () => {};
    Ember.Test.adapter.exception = () => {};

    server.post('/deliveryRules', () => {
```

### Unknown Global

**Global**: `Ember.Logger`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 456

```js
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/acceptance/schedule-modal-test.js` at line 457

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
