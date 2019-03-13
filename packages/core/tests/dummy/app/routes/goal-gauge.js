import { A } from '@ember/array';
import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return A([
      {
        response: { rows: [{ DAU: 3060000000 }] },
        request: { metrics: [{ metric: 'DAU', parameters: {} }] }
      }
    ]);
  }
});
