import { module, test } from 'qunit';
import Keg from '@yavin/client/utils/classes/keg';

interface RecordValue extends Record<string, any> {
  id: number;
  description: string;
  meta: string;
}
class MyRecord extends Object implements RecordValue {
  declare id: number;
  declare description: string;
  declare meta: string;
  constructor(value: unknown) {
    super();
    Object.assign(this, value);
  }
}

let KegInstance: Keg;
let Record1: MyRecord, Record2: MyRecord, Record3: MyRecord;
let RawRecord1: RecordValue, RawRecord2: RecordValue, RawRecord3: RecordValue;

module('Unit | Utils | Classes | keg', function (hooks) {
  hooks.beforeEach(function () {
    KegInstance = new Keg();

    RawRecord1 = { id: 1, description: 'foo', meta: 'ember' };
    RawRecord2 = { id: 2, description: 'bar', meta: 'bard' };
    RawRecord3 = { id: 3, description: 'bar', meta: 'keg' };

    Record1 = new MyRecord(RawRecord1);
    Record2 = new MyRecord(RawRecord2);
    Record3 = new MyRecord(RawRecord3);
  });

  test('_getRecordKegForType returns a keg for a type', function (assert) {
    const recordKeg = KegInstance._getRecordKegForType('record');
    assert.deepEqual(recordKeg, [], '_getRecordKegForType returns an empty array when called the first time');

    //Mock a record insert
    recordKeg.push({ id: 1 });

    assert.deepEqual(
      KegInstance._getRecordKegForType('record'),
      [{ id: 1 }],
      '_getRecordKegForType returns the existing array when called after initially'
    );
  });

  test('_getIdIndexForType returns an id index for a type', function (assert) {
    const idIndex = KegInstance._getIdIndexForType('record');
    assert.deepEqual(idIndex, {}, '_getIdIndexForType returns an empty object when called the first time');

    //Mock a record insert
    idIndex[1] = { id: 1 };

    assert.deepEqual(
      KegInstance._getIdIndexForType('record'),
      { 1: { id: 1 } },
      '_getIdIndexForType returns the existing object when called after initially'
    );
  });

  test('reset clears all state of the keg', function (assert) {
    //@ts-expect-error - mock value
    KegInstance.recordKegs = { foo: 'bar' };
    //@ts-expect-error - mock value
    KegInstance.idIndexes = { foo: 'bar' };

    KegInstance.reset();

    assert.deepEqual(KegInstance.recordKegs, {}, 'reset resets recordKegs');
    assert.deepEqual(KegInstance.idIndexes, {}, 'reset resets idIndexes');
  });

  test('reset by type clears one model type from the keg', function (assert) {
    //@ts-expect-error - mock value
    KegInstance.recordKegs = { foo: 'bar', ham: 'spam' };
    //@ts-expect-error - mock value
    KegInstance.idIndexes = { foo: 'bar', ham: 'spam' };

    KegInstance.resetByType('foo');

    assert.deepEqual(
      KegInstance.recordKegs,
      //@ts-expect-error - mock value
      { foo: [], ham: 'spam' },
      'resets foo type, but leaves ham alone in recordKegs'
    );

    assert.deepEqual(
      KegInstance.idIndexes,
      //@ts-expect-error - mock value
      { foo: {}, ham: 'spam' },
      'resets foo type, but leaves ham alone in idIndexes'
    );
  });

  test('insert pushes a record into the keg', function (assert) {
    const insertedRecord = KegInstance.insert('record', Record1);
    assert.equal(Record1, insertedRecord, '`insert` returns the inserted record');

    const foundRecord = KegInstance.getById('record', 1, 'yavin');
    assert.equal(Record1, foundRecord, 'after inserting a record it can be found');
  });

  test('inserting a record with an existing id update the record in the keg', function (assert) {
    //Insert initial record
    const insertedRecord = KegInstance.insert('record', Record1);

    //Insert new record with same id
    const newRecord = new MyRecord({ ...RawRecord1, description: 'updated' });
    KegInstance.insert('record', newRecord);

    let fetchedRecord = KegInstance.getById('record', 1);

    assert.deepEqual(
      KegInstance.all('record'),
      [newRecord],
      'Inserting a record into the keg with an existing id does not add a new record'
    );

    assert.equal(insertedRecord, fetchedRecord, 'After update fetched record still the same object');
  });

  test('insertMany pushes many records into the keg', function (assert) {
    const records = [Record1, Record2];
    const pushedRecords = KegInstance.insertMany('record', records);
    assert.ok(
      pushedRecords.every((rec, idx) => rec === records[idx]),
      'insertMany returns an array of the inserted records'
    );

    const allRecords = KegInstance.all('record');
    assert.ok(
      records.every((rec, idx) => rec === allRecords[idx]),
      'The inserted records are the same as the fetched records'
    );

    assert.ok(
      KegInstance.recordKegs.record.every((rec, idx) => rec === records[idx]),
      'The inserted records are registered in recordKeg'
    );

    assert.deepEqual(
      KegInstance.idIndexes.record,
      {
        'yavin.1': records[0],
        'yavin.2': records[1],
      },
      'The inserted records are registered in idIndexes'
    );
  });

  test('insertMany updates keg records when provided records have the same id', function (assert) {
    const firstPush = KegInstance.insertMany('record', [Record1, Record2]);

    const secondPush = KegInstance.insertMany('record', [
      new MyRecord({ ...RawRecord1, description: 'updated' }),
      Record3,
      new MyRecord({ id: 4, description: 'partially loaded record', partialData: true }),
    ]);

    assert.deepEqual(
      KegInstance.all('record'),
      [...firstPush, secondPush[1], secondPush[2]],
      'Inserting records into the keg with an existing id does not add a new record'
    );

    assert.equal(secondPush[0], firstPush[0], 'After update fetched record still the same object');

    const fetchedRecord = KegInstance.getById('record', 1);
    assert.equal(
      fetchedRecord?.description,
      'updated',
      'Inserting a record into the keg with an existing id updates the record'
    );

    assert.equal(fetchedRecord, firstPush[0], 'After updating a record the same object is return when fetching');

    const thirdPush = KegInstance.insertMany('record', [new MyRecord({ id: 4, description: 'Fully loaded record' })]);

    assert.deepEqual(
      KegInstance.all('record'),
      [...firstPush, secondPush[1], ...thirdPush],
      'Inserting a record into the keg with an existing id containing partial data does not add a new record'
    );

    assert.notOk(
      KegInstance.getById('record', 4)?.partialData,
      'Partial flag is removed when partial record is updated without flag in update set'
    );

    assert.equal(secondPush[2], thirdPush[0], 'After update the returned record is the same object');
  });

  test('insertMany with identifierField option', function (assert) {
    const records = [Record1, Record2];
    KegInstance.insertMany('record', records, { identifierField: 'description' });

    assert.deepEqual(
      KegInstance.idIndexes.record,
      {
        'yavin.foo': records[0],
        'yavin.bar': records[1],
      },
      'The inserted records are registered in idIndexes using the `identifierField` option'
    );

    assert.equal(KegInstance.getById('record', 'foo'), records[0], 'Record1 is fetched using the `identifierField`');
  });

  test('getById can be used to find a record by id', function (assert) {
    KegInstance.insert('record', Record1);

    const foundRecord = KegInstance.getById('record', 1);
    assert.ok(foundRecord, 'after pushing a record it can be found');

    assert.equal(foundRecord?.id, RawRecord1.id, 'record has correct id');

    assert.equal(foundRecord?.description, RawRecord1.description, 'record has correct description');

    const missingRecord = KegInstance.getById('record', 22);
    assert.equal(missingRecord, undefined, 'getById returns undefined when given an id that is not present');

    const missingType = KegInstance.getById('nonRegisteredType', 22);
    assert.equal(missingType, undefined, 'getById returns undefined when given a type that is not present');
  });

  test('getBy can be used to search by fields when an object is passed', function (assert) {
    KegInstance.insertMany('record', [Record1, Record2, Record3]);

    const foundRecords1 = KegInstance.getBy('record', { description: 'foo' });
    assert.deepEqual(
      foundRecords1.map((r) => r.id),
      [1],
      'getBy returns an array when a single record was found'
    );

    let foundRecords2 = KegInstance.getBy('record', { description: 'bar' });
    assert.deepEqual(
      foundRecords2.map((r) => r.id),
      [2, 3],
      'getBy returns an array when several records were found'
    );

    let foundRecords3 = KegInstance.getBy('record', {
      description: 'bar',
      meta: 'keg',
    });
    assert.deepEqual(
      foundRecords3.map((r) => r.id),
      [3],
      'getBy returns an array of found records when it matches all key-value pairs'
    );

    let foundRecords4 = KegInstance.getBy('record', {
      description: 'bar',
      meta: 'foo',
    });
    assert.deepEqual(
      foundRecords4.map((r) => r.id),
      [],
      'getBy returns an empty array when not all key-value pairs match'
    );

    let foundRecords5 = KegInstance.getBy('record', { description: 'ba' });
    assert.deepEqual(
      foundRecords5.map((r) => r.id),
      [],
      'getBy returns an empty array when no records were found'
    );

    let foundRecords6 = KegInstance.getBy('record', {});
    assert.deepEqual(
      foundRecords6.map((r) => r.id),
      [1, 2, 3],
      'getBy returns all records when an empty object is provided'
    );

    let foundRecords7 = KegInstance.getBy('record', { meta: ['ember', 'keg'] });
    assert.deepEqual(
      foundRecords7.map((r) => r.id),
      [1, 3],
      'getBy returns all records when multiple values for a field is provided'
    );

    let missingType = KegInstance.getBy('nonRegisteredType', { id: 1 });
    assert.deepEqual(missingType, [], 'getBy returns an empty array when given a type that is not present');
  });

  test('getBy can be used to search by fields when a function is passed', function (assert) {
    KegInstance.insertMany('record', [Record1, Record2, Record3]);

    const foundRecords1 = KegInstance.getBy('record', (rec) => {
      return rec.id < 2;
    });
    assert.deepEqual(
      foundRecords1.map((r) => r.id),
      [1],
      'getBy returns an array when a single record was found'
    );

    const foundRecords2 = KegInstance.getBy('record', (rec) => {
      return rec.description === 'bar';
    });
    assert.deepEqual(
      foundRecords2.map((r) => r.id),
      [2, 3],
      'getBy returns an array when a several record was found'
    );

    const foundRecords3 = KegInstance.getBy('record', () => false);
    assert.deepEqual(
      foundRecords3.map((r) => r.id),
      [],
      'getBy returns an empty array when no records were found'
    );
  });

  test('all returns all records for a type', function (assert) {
    assert.deepEqual(
      KegInstance.all('record'),
      [],
      'all returns an empty array if on records have been pushed for the provided type'
    );

    const pushedRecords = KegInstance.insertMany('record', [Record1, Record2, Record3]);
    assert.deepEqual(
      KegInstance.all('record'),
      pushedRecords,
      'all returns all records in the keg for the provided type'
    );
  });
});
