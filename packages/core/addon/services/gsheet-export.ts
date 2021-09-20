/**
 * Copyright (c) 2021, Yahoo! Inc.
 */
import Service from '@ember/service';
import { timeout, task } from 'ember-concurrency';

type Options = { pollRateMs?: number; timeoutMs?: number };
export type GSheetExport = {
  url: string;
  fileId: string;
};
export type GSheetStatus = {
  spreadsheetId: string;
  hasMovedToTeamDrive: boolean;
  createdTime: string;
  modifiedTime: string;
};

export default class GsheetExportService extends Service {
  POLL_RATE_MS = 5 * 1000;
  TIMEOUT_MS = 1.8e6;

  /**
   * Fetches the given URL
   * @param exportUrl - the url of gsheet export
   * @param signal - a signal so that the request can be cancelled if need be
   */
  async fetchURL(exportUrl: URL, signal: AbortSignal | null = null): Promise<GSheetExport> {
    const response = await fetch(`${exportUrl}`, {
      credentials: 'include',
      signal,
    });
    if (!response.ok) {
      throw new Error(`Error while fetching GSheet Export ${response.status} - ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Checks in on a gsheet to see if it has been moved to the team drive or not
   * @param exportUrl - the url of gsheet export
   * @param fileId - the fileId of the gsheet being checked on
   * @param signal - a signal so that the request can be cancelled if need be
   */
  async pollGsheet(exportUrl: URL, fileId: string, signal: AbortSignal | null = null): Promise<GSheetStatus> {
    const response = await fetch(`${exportUrl.origin}/gsheet-export/status/${fileId}`, {
      credentials: 'include',
      signal,
    });
    if (!response.ok) {
      throw new Error(
        `Error while fetching GSheet Export for ${exportUrl} ${response.status} - ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Fetches a gsheet and then polls until either it reaches a google team drive or times out
   * @param exportUrl - the url of gsheet export
   * @param options - an object containing information to control the timeout and poll rate settings
   */
  @task *fetchAndPollGsheet(exportUrl: URL, options: Options = {}) {
    const pollOptions = { pollRateMs: this.POLL_RATE_MS, timeoutMs: this.TIMEOUT_MS, ...options };
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const spreadsheetInfo: GSheetExport = yield this.fetchURL(exportUrl, signal);
      let done = false;
      const startTime = Number(new Date());

      while (Number(new Date()) - startTime < pollOptions.timeoutMs) {
        const pollResponse: GSheetStatus = yield this.pollGsheet(exportUrl, spreadsheetInfo.fileId, signal);
        if (pollResponse.hasMovedToTeamDrive) {
          done = true;
          break;
        }
        yield timeout(pollOptions.pollRateMs);
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
