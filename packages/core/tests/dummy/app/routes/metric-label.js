import { A } from '@ember/array';
import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return A([
      {
        response: {
          rows: [
            {
              bottles: 1000000,
              hp: 12,
              magic: 14,
              rupees: 3600100,
              arrows: 9999999999
            }
          ]
        }
      }
    ]);
  }
});
