import Application from '@ember/application';
//@ts-ignore
import FragmentTransform from 'ember-data-model-fragments/transforms/fragment';

const Fragment = FragmentTransform.extend({
  type: 'visualization-v2',
  polymorphicTypeProp: 'type',
  modelNameFor(data: any) {
    let store = this.store;
    let modelName = this.type;
    let polymorphicTypeProp = this.polymorphicTypeProp;

    if (data && polymorphicTypeProp && data[polymorphicTypeProp]) {
      const polymorphicType = data[polymorphicTypeProp];
      try {
        // Check if serializer for polymorphic type exists first (e.g. line-chart)
        store.serializerFor(polymorphicType);
        modelName = polymorphicType;
      } catch (e) {
        // and if not fall back to the generic visualization-v2 one
        modelName = this.type;
      }
    }

    return modelName;
  },
});

export function initialize(application: Application): void {
  application.register('transform:-mf-fragment$visualization-v2$type', Fragment);
}

export default {
  name: 'visualization-v2-transform',
  initialize,
};
