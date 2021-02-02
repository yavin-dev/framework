import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Screen extends Service {
  @tracked isMobile: boolean;

  constructor() {
    super(...arguments);
    const query = window.matchMedia('(max-width: 599px)');
    this.isMobile = query.matches;
    query.addEventListener('change', e => (this.isMobile = e.matches));
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    screen: Screen;
  }
}
