/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action } from '@ember/object';
import perspective, { TableData } from '@finos/perspective';
import '@finos/perspective-viewer';
import '@finos/perspective-viewer-datagrid';
import '@finos/perspective-viewer-d3fc';
import YavinVisualizationComponent, { YavinVisualizationArgs } from 'navi-core/visualization/component';
import { PerspectiveSettings } from '../manifest';
import { isEqual, merge } from 'lodash-es';
import { task, TaskGenerator } from 'ember-concurrency';
import type { HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';
import type { Grain } from '@yavin/client/utils/date';
import ColumnFragment from 'navi-core/addon/models/request/column';
import { shouldPolyfill as shouldPolyfillSupportedValues, supportedValuesOf } from '@formatjs/intl-enumerator';
import '@formatjs/intl-datetimeformat/polyfill';
import '@formatjs/intl-datetimeformat/locale-data/en'; // locale-data for en
import '@formatjs/intl-datetimeformat/add-all-tz'; // Add ALL tz data

const worker = perspective.shared_worker();

const UTC_TZ = 'UTC';
if (shouldPolyfillSupportedValues()) {
  Object.defineProperty(Intl, 'supportedValuesOf', {
    value: supportedValuesOf,
    enumerable: true,
    writable: true, // allow override to inject utc if needed
    configurable: false,
  });
}

const UTC_SUPPORTED = (function doesSupportUTC() {
  const date = new Date();
  const formatted = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long', timeZone: 'UTC' }).format(
    date
  );
  return formatted.includes(UTC_TZ);
})();

function forceUTCSupport() {
  const supportedValues = Intl.supportedValuesOf('timeZone');
  if (supportedValues.includes(UTC_TZ)) {
    // UTC is already supported
    return;
  }
  if (UTC_SUPPORTED) {
    const originalSupportedValuesOf = Intl.supportedValuesOf;
    //@ts-expect-error - overriding
    Intl.supportedValuesOf = function overrideSupportedValuesOf(type) {
      const supportedValues = originalSupportedValuesOf.call(this, ...arguments);
      if (type === 'timeZone') {
        return [...supportedValues, UTC_TZ];
      }
      return supportedValues;
    };
  }
}

export default class PerspectiveVisualization extends YavinVisualizationComponent<PerspectiveSettings> {
  isLoaded = false;

  constructor(owner: unknown, args: YavinVisualizationArgs<PerspectiveSettings>) {
    super(owner, args);
    forceUTCSupport();
  }

  @task *handleConfigUpdate(e: { target: HTMLPerspectiveViewerElement }): TaskGenerator<void> {
    const configuration = yield e.target.save();
    this.saveSettings(configuration);
  }

  saveSettings(configuration: PerspectiveSettings['configuration'] = {}): void {
    const {
      isLoaded,
      args: { settings, isReadOnly },
    } = this;
    delete configuration.settings; //don't save the open/closed state of the settings panel
    if (isLoaded && !isReadOnly && !isEqual(configuration, settings?.configuration)) {
      this.args.onUpdateSettings({ configuration });
    }
  }

  setupSettingsBtn(viewer: HTMLPerspectiveViewerElement) {
    const visibility = this.args.isReadOnly ? 'hidden' : 'visible';
    const settingsBtn = viewer.shadowRoot?.querySelector('#settings_button');
    if (settingsBtn) {
      //set visibility of settings button based on `isReadOnly`
      (settingsBtn as HTMLElement).style.visibility = visibility;
    }
  }

  @action
  async loadData(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    const { response } = this.args;
    const data = response.rows as TableData;
    const table = await worker.table(data);
    this.setupSettingsBtn(viewer);
    await viewer.load(table);
  }

  async getDefaultSettings(): Promise<PerspectiveSettings> {
    const isDayAligned = (grain: Grain) => !['hour', 'minute', 'second'].includes(grain);

    const { request, settings } = this.args;
    const currentPlugin = settings.configuration?.plugin;
    if (currentPlugin !== undefined && currentPlugin !== 'Datagrid') {
      return {};
    }
    const columnConfig = Object.fromEntries(
      request.columns
        .filter((c) => c.type === 'timeDimension')
        .map((column: ColumnFragment<'timeDimension'>) => {
          const currentSettings = settings.configuration?.plugin_config?.columns?.[column.canonicalName];
          const colTimeZone = column.columnMetadata.timeZone;
          const timeZone =
            // Use column specified timeZone if available, then try UTC, and fallback to undefined
            Intl.supportedValuesOf('timeZone').find((tz) => tz === colTimeZone) ?? (UTC_SUPPORTED ? UTC_TZ : undefined);
          const columnSettings = isDayAligned(column.parameters.grain as Grain)
            ? {
                timeZone,
                // if a timeZone is already specified, don't do anything else
                ...(currentSettings?.timeZone ? {} : { timeStyle: 'disabled' }),
              }
            : { timeZone };
          return [column.canonicalName, columnSettings];
        })
    );

    return {
      configuration: {
        plugin_config: {
          columns: {
            ...columnConfig,
          },
        },
      },
    };
  }

  @action
  async loadSettings(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    this.isLoaded = false;
    const { settings } = this.args;

    const defaults = await this.getDefaultSettings();
    const settingsWithDefaults = merge(defaults, settings);
    await viewer.restore(settingsWithDefaults?.configuration ?? {});
    const configuration = await viewer.save();
    this.isLoaded = true;
    this.saveSettings(configuration); //save just incase loaded settings changed
  }

  @action
  async setupElement(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    await this.loadData(viewer);
    await this.loadSettings(viewer);
  }
}
