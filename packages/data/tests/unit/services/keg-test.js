import EmberObject, { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Keg, Record1, Record2, Record3, RawRecord1, RawRecord2, RawRecord3, RecordFactory;

module('Unit | Service | keg', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Keg = this.owner.lookup('service:keg');

    this.owner.register('model:record', EmberObject.extend());
    RecordFactory = this.owner.factoryFor('model:record');

    RawRecord1 = { id: 1, description: 'foo', meta: 'ember' };
    RawRecord2 = { id: 2, description: 'bar', meta: 'bard' };
    RawRecord3 = { id: 3, description: 'bar', meta: 'keg' };

    Record1 = RecordFactory.create(RawRecord1);
    Record2 = RecordFactory.create(RawRecord2);
    Record3 = RecordFactory.create(RawRecord3);
  });

  test('_getFactoryForType returns factory for a model type', function(assert) {
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
    const recordKeg = Keg._getRecordKegForType('record');
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
    const idIndex = Keg._getIdIndexForType('record');
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
    set(Keg, 'recordKegs', { foo: 'bar' });
    set(Keg, 'idIndexes', { foo: 'bar' });

    Keg.reset();

    assert.deepEqual(Keg.recordKegs, {}, 'reset resets recordKegs');

    assert.deepEqual(Keg.idIndexes, {}, 'reset resets idIndexes');
  });

  test('reset by type clears one model type from the keg', function(assert) {
    set(Keg, 'recordKegs', { foo: 'bar', ham: 'spam' });
    set(Keg, 'idIndexes', { foo: 'bar', ham: 'spam' });

    Keg.resetByType('foo');

    assert.deepEqual(Keg.recordKegs, { foo: [], ham: 'spam' }, 'resets foo type, but leaves ham alone in recordKegs');

    assert.deepEqual(Keg.idIndexes, { foo: {}, ham: 'spam' }, 'resets foo type, but leaves ham alone in idIndexes');
  });

  test('push inserts a record into the keg', function(assert) {
    const pushedRecord = Keg.push('record', RawRecord1);
    assert.ok(pushedRecord instanceof RecordFactory.class, 'push returns an instance of the given type');

    assert.equal(pushedRecord.id, RawRecord1.id, 'The returned record has the correct id');

    assert.equal(pushedRecord.description, RawRecord1.description, 'The returned record has the correct description');

    assert.equal(Keg.recordKegs.record.firstObject, pushedRecord, 'The pushed record is registered in recordKeg');

    assert.deepEqual(Keg.idIndexes.record, { 'navi.1': pushedRecord }, 'The pushed record is registered in idIndexes');

    let foundRecord = Keg.getById('record', 1, 'navi');
    assert.ok(foundRecord, 'after pushing a record it can be found');

    assert.equal(pushedRecord, foundRecord, 'The pushed record is the same as the found record');
  });

  test('insert pushes a record into the keg', function(assert) {
    const insertedRecord = Keg.insert('record', Record1);
    assert.equal(Record1, insertedRecord, '`insert` returns the inserted record');

    const foundRecord = Keg.getById('record', 1, 'navi');
    assert.equal(Record1, foundRecord, 'after inserting a record it can be found');
  });

  test('pushing a record with an existing id update the record in the keg', function(assert) {
    //Insert initial record
    const pushedRecord = Keg.push('record', RawRecord1);

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
      fetchedRecord.description,
      'updated',
      'Pushing a record into the keg with an existing id updates the record'
    );
  });

  test('inserting a record with an existing id update the record in the keg', function(assert) {
    //Insert initial record
    const insertedRecord = Keg.insert('record', Record1);

    //Insert new record with same id
    const newRecord = RecordFactory.create({ ...RawRecord1, description: 'updated' });
    Keg.insert('record', newRecord);

    let fetchedRecord = Keg.getById('record', 1);

    assert.deepEqual(
      Keg.all('record'),
      [newRecord],
      'Inserting a record into the keg with an existing id does not add a new record'
    );

    assert.equal(insertedRecord, fetchedRecord, 'After update fetched record still the same object');
  });

  test('push can take an explicit modelFactory', function(assert) {
    const pushedRecord = Keg.push('notRecord', RawRecord1, {
      modelFactory: 'record'
    });

    assert.ok(pushedRecord instanceof RecordFactory.class, 'push returns an object instance of the explicit type');
  });

  test('pushMany inserts many records into the keg', function(assert) {
    const rawRecords = [RawRecord1, RawRecord2];
    const pushedRecords = Keg.pushMany('record', rawRecords);

    assert.ok(
      pushedRecords.every(rec => rec instanceof RecordFactory.class),
      'pushMany returns an array of instances of the given type'
    );

    assert.deepEqual(pushedRecords.mapBy('id'), [1, 2], 'pushed records have the correct ids');

    assert.deepEqual(
      pushedRecords.mapBy('description'),
      ['foo', 'bar'],
      'pushed records have the correct descriptions'
    );

    let allRecords = Keg.all('record');
    assert.ok(
      pushedRecords.every((rec, idx) => pushedRecords[idx] === allRecords[idx]),
      'The pushed records are the same as the fetched records'
    );

    assert.deepEqual(
      Keg.recordKegs.record.toArray(),
      pushedRecords.toArray(),
      'The pushed records are registered in recordKeg'
    );

    assert.deepEqual(
      Keg.idIndexes.record,
      {
        'navi.1': pushedRecords[0],
        'navi.2': pushedRecords[1]
      },
      'The pushed records are registered in idIndexes'
    );
  });

  test('insertMany pushes many records into the keg', function(assert) {
    const records = [Record1, Record2];
    const pushedRecords = Keg.insertMany('record', records);
    assert.ok(
      pushedRecords.every((rec, idx) => rec === records[idx]),
      'insertMany returns an array of the inserted records'
    );

    const allRecords = Keg.all('record');
    assert.ok(
      records.every((rec, idx) => rec === allRecords[idx]),
      'The inserted records are the same as the fetched records'
    );

    assert.ok(
      Keg.recordKegs.record.toArray().every((rec, idx) => rec === records[idx]),
      'The inserted records are registered in recordKeg'
    );

    assert.deepEqual(
      Keg.idIndexes.record,
      {
        'navi.1': records[0],
        'navi.2': records[1]
      },
      'The inserted records are registered in idIndexes'
    );
  });

  test('pushMany updates keg records when provided records have the same id', function(assert) {
    const firstPush = Keg.pushMany('record', [RawRecord1, RawRecord2]);

    const secondPush = Keg.pushMany('record', [
      { id: 1, description: 'updated' },
      RawRecord3,
      { id: 4, description: 'partially loaded record', partialData: true }
    ]);

    assert.deepEqual(
      Keg.all('record'),
      [...firstPush, secondPush[1], secondPush[2]],
      'Pushing records into the keg with an existing id does not add a new record'
    );

    assert.equal(secondPush.firstObject, firstPush.firstObject, 'After update fetched record still the same object');

    const fetchedRecord = Keg.getById('record', 1);
    assert.equal(
      fetchedRecord.description,
      'updated',
      'Pushing a record into the keg with an existing id updates the record'
    );

    assert.equal(
      fetchedRecord,
      firstPush.firstObject,
      'After updating a record the same object is return when fetching'
    );

    const thirdPush = Keg.pushMany('record', [
      {
        id: 4,
        description: 'Fully loaded record'
      }
    ]);

    assert.deepEqual(
      Keg.all('record'),
      [...firstPush, secondPush[1], ...thirdPush],
      'Pushing a record into the keg with an existing id containing partial data does not add a new record'
    );

    assert.notOk(
      Keg.getById('record', 4).partialData,
      'Partial flag is removed when partial record is updated without flag in update set'
    );

    assert.equal(secondPush[2], thirdPush[0], 'After update the returned record is the same object');
  });

  test('insertMany updates keg records when provided records have the same id', function(assert) {
    const firstPush = Keg.insertMany('record', [Record1, Record2]);

    const secondPush = Keg.insertMany('record', [
      RecordFactory.create({ ...RawRecord1, description: 'updated' }),
      Record3,
      RecordFactory.create({ id: 4, description: 'partially loaded record', partialData: true })
    ]);

    assert.deepEqual(
      Keg.all('record'),
      [...firstPush, secondPush[1], secondPush[2]],
      'Inserting records into the keg with an existing id does not add a new record'
    );

    assert.equal(secondPush.firstObject, firstPush.firstObject, 'After update fetched record still the same object');

    const fetchedRecord = Keg.getById('record', 1);
    assert.equal(
      fetchedRecord.description,
      'updated',
      'Inserting a record into the keg with an existing id updates the record'
    );

    assert.equal(
      fetchedRecord,
      firstPush.firstObject,
      'After updating a record the same object is return when fetching'
    );

    const thirdPush = Keg.insertMany('record', [RecordFactory.create({ id: 4, description: 'Fully loaded record' })]);

    assert.deepEqual(
      Keg.all('record'),
      [...firstPush, secondPush[1], ...thirdPush],
      'Inserting a record into the keg with an existing id containing partial data does not add a new record'
    );

    assert.notOk(
      Keg.getById('record', 4).partialData,
      'Partial flag is removed when partial record is updated without flag in update set'
    );

    assert.equal(secondPush[2], thirdPush[0], 'After update the returned record is the same object');
  });

  test('pushMany can take an explicit modelFactory', function(assert) {
    const pushedRecords = Keg.pushMany('notRecord', [RawRecord1, RawRecord2], {
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
    const recordFactory = this.owner.factoryFor('model:record').class;

    recordFactory.reopenClass({
      identifierField: 'description'
    });

    const rawRecords = [RawRecord1, RawRecord2];
    const pushedRecords = Keg.pushMany('record', rawRecords);

    assert.deepEqual(
      Keg.idIndexes.record,
      {
        'navi.foo': pushedRecords[0],
        'navi.bar': pushedRecords[1]
      },
      'The pushed records are registered in idIndexes using identifierField defined in factory'
    );

    assert.equal(
      Keg.getById('record', 'foo'),
      pushedRecords[0],
      'Record1 is fetched using the `identifierField` defined in the factory'
    );
  });

  test('insertMany with identifierField option', function(assert) {
    const records = [Record1, Record2];
    Keg.insertMany('record', records, { identifierField: 'description' });

    assert.deepEqual(
      Keg.idIndexes.record,
      {
        'navi.foo': records[0],
        'navi.bar': records[1]
      },
      'The inserted records are registered in idIndexes using the `identifierField` option'
    );

    assert.equal(Keg.getById('record', 'foo'), records[0], 'Record1 is fetched using the `identifierField`');
  });

  test('getById can be used to find a record by id', function(assert) {
    Keg.push('record', RawRecord1);

    const foundRecord = Keg.getById('record', 1);
    assert.ok(foundRecord, 'after pushing a record it can be found');

    assert.equal(foundRecord.id, RawRecord1.id, 'record has correct id');

    assert.equal(foundRecord.description, RawRecord1.description, 'record has correct description');

    const missingRecord = Keg.getById('record', 22);
    assert.equal(missingRecord, undefined, 'getById returns undefined when given an id that is not present');

    const missingType = Keg.getById('nonRegisteredType', 22);
    assert.equal(missingType, undefined, 'getById returns undefined when given a type that is not present');
  });

  test('getBy can be used to search by fields when an object is passed', function(assert) {
    Keg.pushMany('record', [RawRecord1, RawRecord2, RawRecord3]);

    const foundRecords1 = Keg.getBy('record', { description: 'foo' });
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
    Keg.pushMany('record', [RawRecord1, RawRecord2, RawRecord3]);

    const foundRecords1 = Keg.getBy('record', rec => {
      return rec.id < 2;
    });
    assert.deepEqual(foundRecords1.mapBy('id'), [1], 'getBy returns an array when a single record was found');

    const foundRecords2 = Keg.getBy('record', rec => {
      return rec.description === 'bar';
    });
    assert.deepEqual(foundRecords2.mapBy('id'), [2, 3], 'getBy returns an array when a several record was found');

    const foundRecords3 = Keg.getBy('record', () => false);
    assert.deepEqual(foundRecords3.mapBy('id'), [], 'getBy returns an empty array when no records were found');
  });

  test('all returns all records for a type', function(assert) {
    assert.deepEqual(
      Keg.all('record').toArray(),
      [],
      'all returns an empty array if on records have been pushed for the provided type'
    );

    const pushedRecords = Keg.pushMany('record', [RawRecord1, RawRecord2, RawRecord3]);
    assert.deepEqual(
      Keg.all('record').toArray(),
      pushedRecords.toArray(),
      'all returns all records in the keg for the provided type'
    );

    const unregisteredTypeRecords = Keg.pushMany('unregisteredType', [RawRecord1, RawRecord2, RawRecord3], {
      modelFactory: Object
    });
    assert.deepEqual(
      Keg.all('unregisteredType').toArray(),
      unregisteredTypeRecords.toArray(),
      'all returns all records in the keg for the unregisteredType type'
    );
  });
});
