/**
 * Copyright (c) 2021, Yahoo! Inc.
 */
import Service from '@ember/service';
import { timeout, task } from 'ember-concurrency';

export default class GsheetExportService extends Service {
  POLL_RATE_MS = 5 * 1000;
  TIMEOUT_MS = 1.8e6;

  /**
   * Fetches the given URL
   * @param exportUrl - from the ExportUrlService in 'dataverse-core/services/export-url'
   * @param urlSuffix - the url of the gsheet to be fetched
   * @param signal - a signal so that the request can be cancelled if need be
   */
  async fetchURL(exportUrl: string, urlSuffix: string, signal: AbortSignal | null = null) {
    const response = await fetch(`${exportUrl}/${urlSuffix}`, {
      credentials: 'include',
      signal,
    });
    if (!response.ok) {
      throw new Error(`Bad Response From Server ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Checks in on a gsheet to see if it has been moved to the team drive or not
   * @param exportUrl - from the ExportUrlService in 'dataverse-core/services/export-url'
   * @param fileId - the fileId of the gsheet being checked on
   * @param signal - a signal so that the request can be cancelled if need be
   */
  async pollGsheet(exportUrl: string, fileId: string, signal: AbortSignal | null = null) {
    const response = await fetch(`${exportUrl}/gsheet-export/status/${fileId}`, {
      credentials: 'include',
      signal,
    });
    if (!response.ok) {
      throw new Error(`Bad Response From Server ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetches a gsheet and then polls until either it reaches a google team drive or times out
   * @param exportUrl - the portion of the URL that will be used for both fetch and poll
   * @param urlSuffix - the portion of the URL that will only be used for fetch
   */
  @task *fetchAndPollGsheet(exportUrl: string, urlSuffix: string) {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const spreadsheetInfo: { fileId: string; url: string } = yield this.fetchURL(exportUrl, urlSuffix, signal);
      const startTime = Number(new Date());
      let done = false;

      while (Number(new Date()) - startTime < this.TIMEOUT_MS) {
        const pollResponse: { hasMovedToTeamDrive: boolean } = yield this.pollGsheet(
          exportUrl,
          spreadsheetInfo.fileId,
          signal
        );
        if (pollResponse.hasMovedToTeamDrive) {
          done = true;
          break;
        }
        yield timeout(this.POLL_RATE_MS);
      }
      if (!done) {
        throw new Error('Poll timeout exceeded');
      }
      return spreadsheetInfo.url;
    } finally {
      controller.abort();
    }
  }
}
