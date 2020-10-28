import DimensionMetadataModel, { DimensionMetadataPayload } from '../dimension';

export type ValueSourceType = 'ENUM' | 'TABLE' | 'NONE';

export interface ElideDimensionMetadataPayload extends DimensionMetadataPayload {
  valueSourceType: ValueSourceType;
  tableSource: string | null;
  values: string[];
}

export default class ElideDimensionMetadataModel extends DimensionMetadataModel
  implements ElideDimensionMetadataPayload {
  valueSourceType!: ValueSourceType;
  tableSource!: string | null;
  values!: string[];
}
