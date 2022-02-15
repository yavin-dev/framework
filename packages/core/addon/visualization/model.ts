import type YavinVisualizationsService from 'navi-core/services/visualization';
import { YavinVisualizationManifest } from './manifest';
import Fragment from 'ember-data-model-fragments/fragment';

export default interface YavinVisualizationModel<T = unknown> extends Fragment {
  visualization: YavinVisualizationsService;

  type: string;
  version: number;
  namespace: string;
  metadata: T;

  typeName: string;
  manifest: YavinVisualizationManifest;

  clone: () => YavinVisualizationModel;
}
