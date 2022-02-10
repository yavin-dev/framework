import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Application extends Controller {
  @tracked
  lastSettings: unknown;

  @tracked
  settings: unknown = {};

  @action
  onUpdateSettings(settings: unknown) {
    this.lastSettings = this.settings;
    this.settings = settings;
  }

  @action
  revertSettings() {
    this.settings = this.lastSettings;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    application: Application;
  }
}
