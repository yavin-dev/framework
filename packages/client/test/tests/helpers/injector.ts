import type { Injector } from '@yavin/client/models/native-with-create';

export const nullInjector: Injector = {
  lookup(_type, _name) {
    return null;
  },
};
