import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import RSVP from 'rsvp';
import type GsheetExportService from 'navi-core/services/gsheet-export';
import { taskFor } from 'ember-concurrency-ts';

let service: GsheetExportService;
const exportURL = new URL('https://export-server-url.com:4443/notAnotherRickRoll');

module('Unit | Service | GsheetExportService', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:gsheet-export');
  });

  test('correctly calls fetch endpoint', async function (assert) {
    let callCount = 0;
    const deferred = RSVP.defer();
    //@ts-ignore
    this.server.pretender.handledRequest = (verb, path) => {
      if (path.endsWith('/notAnotherRickRoll?async=true')) {
        callCount++;
        deferred.resolve(callCount);
      }
    };
    const result = await service.fetchURL(exportURL);
    assert.deepEqual(
      result,
      {
        fileId: 'rickRoll',
        url: 'https://youtu.be/dQw4w9WgXcQ',
      },
      'fetchURL returns correct data from endpoint'
    );

    assert.equal(callCount, 1, 'url endpoint is called correctly');
  });

  test('correctly calls poll endpoint', async function (assert) {
    let callCount = 0;
    const deferred = RSVP.defer();
    //@ts-ignore
    this.server.pretender.handledRequest = (verb, path) => {
      if (path.endsWith('/gsheet-export/status/rickRoll')) {
        callCount++;
        deferred.resolve(callCount);
      }
    };
    const result = await service.pollGsheet(exportURL, 'rickRoll');
    assert.deepEqual(
      result,
      {
        spreadsheetId: 'rickRoll',
        hasMovedToTeamDrive: false,
        createdTime: '2021-09-10T21:12:31.000Z',
        modifiedTime: '2021-09-10T21:22:00.000Z',
      },
      'poll gsheet returns data from endpoint'
    );
  });

  test('correctly fetches gsheet endpoint then polls until moved to drive', async function (assert) {
    let callCountFetch = 0;
    let callCountPoll = 0;
    const deferred = RSVP.defer();
    //@ts-ignore
    this.server.pretender.handledRequest = (verb, path) => {
      if (path.endsWith('/notAnotherRickRoll?async=true')) {
        callCountFetch++;
        deferred.resolve(callCountFetch);
      }
      if (path.endsWith('/gsheet-export/status/rickRoll')) {
        callCountPoll++;
        deferred.resolve(callCountPoll);
      }
    };
    const result = await taskFor(service.fetchAndPollGsheet).perform(exportURL);

    assert.deepEqual(
      result,
      {
        fileId: 'rickRoll',
        url: 'https://youtu.be/dQw4w9WgXcQ',
      },
      'fetchAndPollGsheet returns correct url for requested document'
    );

    assert.equal(callCountFetch, 1, 'fetch url endpoint was called correctly');
    assert.equal(callCountPoll, 3, 'gsheet status endpoint was polled 3 times');
  });

  test('it times out correctly', async function (assert) {
    assert.rejects(
      taskFor(service.fetchAndPollGsheet).perform(exportURL, { timeoutMs: 5000 }),
      /Poll timeout exceeded/,
      'Method throws once poll timeout has exceeded'
    );
  });
});
