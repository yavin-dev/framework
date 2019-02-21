## Module Report

### Unknown Global

**Global**: `Ember.Inflector`

**Location**: `addon/adapters/base-json-adapter.js` at line 54

```js
// Match our API's format for filters since it differs from Ember Data default
let url = this.buildURL(type.modelName, ids, snapshots, 'findMany'),
  filterRoot = Ember.Inflector.inflector.pluralize(type.modelName),
  filterId = `${filterRoot}.id`;
```

### Unknown Global

**Global**: `Ember.String`

**Location**: `addon/adapters/base-json-adapter.js` at line 91

```js
   */
  pathForType(type) {
    return Ember.String.pluralize(Ember.String.camelize(type));
  }
});
```

### Unknown Global

**Global**: `Ember.ActionHandler`

**Location**: `addon/consumers/action-consumer.js` at line 7

```js
import Ember from 'ember';
export default Ember.Object.extend(Ember.ActionHandler, {
  /**
   * @property {Object} actions - object of functions, keyed by name to
```

### Unknown Global

**Global**: `Ember.inject`

**Location**: `addon/services/user.js` at line 9

```js
import config from 'ember-get-config';

const { get, inject } = Ember;
const NOT_FOUND = '404';
```

### Unknown Global

**Global**: `Ember.String.singularize`

**Location**: `addon/serializers/base-json-serializer.js` at line 8

```js
import Ember from 'ember';

const { camelize, dasherize, pluralize, singularize } = Ember.String;

export default DS.JSONAPISerializer.extend({
```

### Unknown Global

**Global**: `Ember.String.pluralize`

**Location**: `addon/serializers/base-json-serializer.js` at line 8

```js
import Ember from 'ember';

const { camelize, dasherize, pluralize, singularize } = Ember.String;

export default DS.JSONAPISerializer.extend({
```

### Unknown Global

**Global**: `Ember.String`

**Location**: `addon/serializers/base-json-serializer.js` at line 8

```js
import Ember from 'ember';

const { camelize, dasherize, pluralize, singularize } = Ember.String;

export default DS.JSONAPISerializer.extend({
```

### Unknown Global

**Global**: `Ember.inject`

**Location**: `addon/components/visualization-config/table.js` at line 16

```js
import layout from '../../templates/components/visualization-config/table';

const { A: arr, computed, copy, get, inject } = Ember;

export default Ember.Component.extend({
```
