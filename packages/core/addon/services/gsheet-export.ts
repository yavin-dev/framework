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
   * @param exportPath - the url of the gsheet to be fetched
   * @param signal - a signal so that the request can be cancelled if need be
   */
  async fetchURL(exportUrl: string, exportPath: string, signal: AbortSignal | null = null): Promise<GSheetExport> {
    const response = await fetch(`${exportUrl}/${exportPath}`, {
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
  async pollGsheet(exportUrl: string, fileId: string, signal: AbortSignal | null = null): Promise<GSheetStatus> {
    const response = await fetch(`${exportUrl}/gsheet-export/status/${fileId}`, {
      credentials: 'include',
      signal,
    });
    if (!response.ok) {
      throw new Error(`Error while fetching GSheet Export ${response.status} - ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetches a gsheet and then polls until either it reaches a google team drive or times out
   * @param exportUrl - the url of gsheet export (the portion of the URL that will be used for both fetch and poll)
   * @param exportPath - the url of the gsheet to be fetched (the portion of the URL that will only be used for fetch)
   */
  @task *fetchAndPollGsheet(exportUrl: string, exportPath: string, options: Options = {}) {
    const pollOptions = { pollRateMs: this.POLL_RATE_MS, timeoutMs: this.TIMEOUT_MS, ...options };
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const spreadsheetInfo: { fileId: string; url: string } = yield this.fetchURL(exportUrl, exportPath, signal);
      const startTime = Number(new Date());
      let done = false;

      while (Number(new Date()) - startTime < pollOptions.timeoutMs) {
        const pollResponse: { hasMovedToTeamDrive: boolean } = yield this.pollGsheet(
          exportUrl,
          spreadsheetInfo.fileId,
          signal
        );
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
