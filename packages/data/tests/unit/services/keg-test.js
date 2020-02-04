import EmberObject, { set, get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Keg, Record1, Record2, Record3, RecordFactory;

module('Unit | Service | keg', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Keg = this.owner.lookup('service:keg');

    Record1 = { id: 1, description: 'foo', meta: 'ember' };
    Record2 = { id: 2, description: 'bar', meta: 'bard' };
    Record3 = { id: 3, description: 'bar', meta: 'keg' };

    this.owner.register('model:record', EmberObject.extend());
    RecordFactory = this.owner.factoryFor('model:record');
  });

  test('_getFactoryForType returns factory for a model type', function(assert) {
    assert.expect(2);

    assert.equal(
      Keg._getFactoryForType('record'),
      RecordFactory.class,
      '_getFactoryForType returns factory of model type when type is registered'
    );

    let testType = {};
    assert.equal(
      Keg._getFactoryForType(testType),
      testType,
      '_getFactoryForType returns given type when type is not a string'
    );
  });

  test('_getRecordKegForType returns a keg for a type', function(assert) {
    assert.expect(2);

    let recordKeg = Keg._getRecordKegForType('record');
    assert.deepEqual(recordKeg.toArray(), [], '_getRecordKegForType returns an empty array when called the first time');

    //Mock a record insert
    recordKeg.pushObject({ id: 1 });

    assert.deepEqual(
      Keg._getRecordKegForType('record').toArray(),
      [{ id: 1 }],
      '_getRecordKegForType returns the existing array when called after initially'
    );
  });

  test('_getIdIndexForType returns an id index for a type', function(assert) {
    assert.expect(2);

    let idIndex = Keg._getIdIndexForType('record');
    assert.deepEqual(idIndex, {}, '_getIdIndexForType returns an empty object when called the first time');

    //Mock a record insert
    idIndex[1] = { id: 1 };

    assert.deepEqual(
      Keg._getIdIndexForType('record'),
      { 1: { id: 1 } },
      '_getIdIndexForType returns the existing object when called after initially'
    );
  });

  test('reset clears all state of the keg', function(assert) {
    assert.expect(2);

    set(Keg, 'recordKegs', { foo: 'bar' });
    set(Keg, 'idIndexes', { foo: 'bar' });

    Keg.reset();

    assert.deepEqual(get(Keg, 'recordKegs'), {}, 'reset resets recordKegs');

    assert.deepEqual(get(Keg, 'idIndexes'), {}, 'reset resets idIndexes');
  });

  test('reset by type clears one model type from the keg', function(assert) {
    assert.expect(2);

    set(Keg, 'recordKegs', { foo: 'bar', ham: 'spam' });
    set(Keg, 'idIndexes', { foo: 'bar', ham: 'spam' });

    Keg.resetByType('foo');

    assert.deepEqual(
      get(Keg, 'recordKegs'),
      { foo: [], ham: 'spam' },
      'resets foo type, but leaves ham alone in recordKegs'
    );

    assert.deepEqual(
      get(Keg, 'idIndexes'),
      { foo: {}, ham: 'spam' },
      'resets foo type, but leaves ham alone in idIndexes'
    );
  });

  test('push inserts a record into the keg', function(assert) {
    assert.expect(7);

    let pushedRecord = Keg.push('record', Record1);
    assert.ok(pushedRecord instanceof RecordFactory.class, 'push returns an instance of the given type');

    assert.equal(get(pushedRecord, 'id'), get(Record1, 'id'), 'The returned record has the correct id');

    assert.equal(
      get(pushedRecord, 'description'),
      get(Record1, 'description'),
      'The returned record has the correct description'
    );

    assert.equal(
      get(Keg, 'recordKegs.record.firstObject'),
      pushedRecord,
      'The pushed record is registered in recordKeg'
    );

    assert.deepEqual(
      get(Keg, 'idIndexes.record'),
      { 'navi.1': pushedRecord },
      'The pushed record is registered in idIndexes'
    );

    let foundRecord = Keg.getById('record', 1, 'navi');
    assert.ok(foundRecord, 'after pushing a record it can be found');

    assert.equal(pushedRecord, foundRecord, 'The pushed record is the same as the found record');
  });

  test('pushing a record with an existing id update the record in the keg', function(assert) {
    assert.expect(3);

    //Push initial record
    let pushedRecord = Keg.push('record', Record1);

    //Push new record with same id
    Keg.push('record', { id: 1, description: 'updated' });

    let fetchedRecord = Keg.getById('record', 1);

    assert.deepEqual(
      Keg.all('record'),
      [pushedRecord],
      'Pushing a record into the keg with an existing id does not add a new record'
    );

    assert.equal(pushedRecord, fetchedRecord, 'After update fetched record still the same object');

    assert.equal(
      get(fetchedRecord, 'description'),
      'updated',
      'Pushing a record into the keg with an existing id updates the record'
    );
  });

  test('push can take an explicit modelFactory', function(assert) {
    assert.expect(1);

    let pushedRecord = Keg.push('notRecord', Record1, {
      modelFactory: 'record'
    });

    assert.ok(pushedRecord instanceof RecordFactory.class, 'push returns an object instance of the explicit type');
  });

  test('pushMany inserts many records into the keg', function(assert) {
    assert.expect(7);

    let rawRecords = [Record1, Record2],
      pushedRecords = Keg.pushMany('record', rawRecords);

    assert.ok(
      pushedRecords.every(rec => {
        return rec instanceof RecordFactory.class;
      }),
      'pushMany returns an array of instances of the given type'
    );

    assert.deepEqual(pushedRecords.mapBy('id'), [1, 2], 'pushed records have the correct ids');

    assert.deepEqual(
      pushedRecords.mapBy('description'),
      ['foo', 'bar'],
      'pushed records have the correct descriptions'
    );

    let allRecords = Keg.all('record');
    pushedRecords.forEach((rec, idx) => {
      assert.equal(
        pushedRecords.get(idx),
        allRecords.get(idx),
        'The pushed records are the same as the fetched records'
      );
    });

    assert.deepEqual(
      get(Keg, 'recordKegs.record').toArray(),
      pushedRecords.toArray(),
      'The pushed records are registered in recordKeg'
    );

    assert.deepEqual(
      get(Keg, 'idIndexes.record'),
      {
        'navi.1': pushedRecords.get(0),
        'navi.2': pushedRecords.get(1)
      },
      'The pushed records are registered in idIndexes'
    );
  });

  test('pushMany updates keg records when provided records have the same id', function(assert) {
    assert.expect(4);

    let firstPush = Keg.pushMany('record', [Record1, Record2]);

    let secondPush = Keg.pushMany('record', [{ id: 1, description: 'updated' }, Record3]);

    assert.deepEqual(
      Keg.all('record'),
      firstPush.concat(secondPush.get(1)),
      'Pushing a records into the keg with an existing id does not add a new record'
    );

    assert.equal(
      secondPush.get('firstObject'),
      firstPush.get('firstObject'),
      'After update fetched record still the same object'
    );

    let fetchedRecord = Keg.getById('record', 1);
    assert.equal(
      get(fetchedRecord, 'description'),
      'updated',
      'Pushing a record into the keg with an existing id updates the record'
    );

    assert.equal(
      fetchedRecord,
      firstPush.get('firstObject'),
      'After updating a record the same object is return when fetching'
    );
  });

  test('pushMany can take an explicit modelFactory', function(assert) {
    assert.expect(1);

    let pushedRecords = Keg.pushMany('notRecord', [Record1, Record2], {
      modelFactory: 'record'
    });

    assert.ok(
      pushedRecords.every(rec => {
        return rec instanceof RecordFactory.class;
      }),
      'pushMany returns an array of instances of the explicit type'
    );
  });

  test('pushMany uses identifierField in factory if available', function(assert) {
    assert.expect(2);

    let recordFactory = this.owner.factoryFor('model:record').class;

    recordFactory.reopenClass({
      identifierField: 'description'
    });

    let rawRecords = [Record1, Record2],
      pushedRecords = Keg.pushMany('record', rawRecords);

    assert.deepEqual(
      get(Keg, 'idIndexes.record'),
      {
        'navi.foo': pushedRecords.get(0),
        'navi.bar': pushedRecords.get(1)
      },
      'The pushed records are registered in idIndexes using identifierField defined in factory'
    );

    assert.equal(
      Keg.getById('record', 'foo'),
      pushedRecords.get(0),
      'Record1 is fetched using the `identifierField` defined in the factory'
    );
  });

  test('getById can be used to find a record by id', function(assert) {
    assert.expect(5);

    Keg.push('record', Record1);

    let foundRecord = Keg.getById('record', 1);
    assert.ok(foundRecord, 'after pushing a record it can be found');

    assert.equal(get(foundRecord, 'id'), get(Record1, 'id'), 'record has correct id');

    assert.equal(get(foundRecord, 'description'), get(Record1, 'description'), 'record has correct description');

    let missingRecord = Keg.getById('record', 22);
    assert.equal(missingRecord, undefined, 'getById returns undefined when given an id that is not present');

    let missingType = Keg.getById('nonRegisteredType', 22);
    assert.equal(missingType, undefined, 'getById returns undefined when given a type that is not present');
  });

  test('getBy can be used to search by fields when an object is passed', function(assert) {
    assert.expect(8);

    Keg.pushMany('record', [Record1, Record2, Record3]);

    let foundRecords1 = Keg.getBy('record', { description: 'foo' });
    assert.deepEqual(foundRecords1.mapBy('id'), [1], 'getBy returns an array when a single record was found');

    let foundRecords2 = Keg.getBy('record', { description: 'bar' });
    assert.deepEqual(foundRecords2.mapBy('id'), [2, 3], 'getBy returns an array when several records were found');

    let foundRecords3 = Keg.getBy('record', {
      description: 'bar',
      meta: 'keg'
    });
    assert.deepEqual(
      foundRecords3.mapBy('id'),
      [3],
      'getBy returns an array of found records when it matches all key-value pairs'
    );

    let foundRecords4 = Keg.getBy('record', {
      description: 'bar',
      meta: 'foo'
    });
    assert.deepEqual(foundRecords4.mapBy('id'), [], 'getBy returns an empty array when not all key-value pairs match');

    let foundRecords5 = Keg.getBy('record', { description: 'ba' });
    assert.deepEqual(foundRecords5.mapBy('id'), [], 'getBy returns an empty array when no records were found');

    let foundRecords6 = Keg.getBy('record', {});
    assert.deepEqual(
      foundRecords6.mapBy('id'),
      [1, 2, 3],
      'getBy returns all records when an empty object is provided'
    );

    let foundRecords7 = Keg.getBy('record', { meta: ['ember', 'keg'] });
    assert.deepEqual(
      foundRecords7.mapBy('id'),
      [1, 3],
      'getBy returns all records when multiple values for a field is provided'
    );

    let missingType = Keg.getBy('nonRegisteredType', { id: 1 });
    assert.deepEqual(missingType, [], 'getBy returns an empty array when given a type that is not present');
  });

  test('getBy can be used to search by fields when a function is passed', function(assert) {
    assert.expect(3);

    Keg.pushMany('record', [Record1, Record2, Record3]);

    let foundRecords1 = Keg.getBy('record', rec => {
      return get(rec, 'id') < 2;
    });
    assert.deepEqual(foundRecords1.mapBy('id'), [1], 'getBy returns an array when a single record was found');

    let foundRecords2 = Keg.getBy('record', rec => {
      return get(rec, 'description') === 'bar';
    });
    assert.deepEqual(foundRecords2.mapBy('id'), [2, 3], 'getBy returns an array when a several record was found');

    let foundRecords3 = Keg.getBy('record', () => false);
    assert.deepEqual(foundRecords3.mapBy('id'), [], 'getBy returns an empty array when no records were found');
  });

  test('all returns all records for a type', function(assert) {
    assert.expect(3);

    assert.deepEqual(
      Keg.all('record').toArray(),
      [],
      'all returns an empty array if on records have been pushed for the provided type'
    );

    let pushedRecords = Keg.pushMany('record', [Record1, Record2, Record3]);
    assert.deepEqual(
      Keg.all('record').toArray(),
      pushedRecords.toArray(),
      'all returns all records in the keg for the provided type'
    );

    let unregisteredTypeRecords = Keg.pushMany('unregisteredType', [Record1, Record2, Record3], {
      modelFactory: Object
    });
    assert.deepEqual(
      Keg.all('unregisteredType').toArray(),
      unregisteredTypeRecords.toArray(),
      'all returns all records in the keg for the unregisteredType type'
    );
  });
});
