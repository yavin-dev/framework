/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { DeliveredItem } from './delivered-items';
import type { JSONApiDef, BelongsTo } from './json-api';
import type { User } from './user';

type BaseFormat<Type> = {
  type: Type;
};
type BaseFormatTypes = 'csv' | 'pdf' | 'png';

type GsheetFormat = {
  type: 'gsheet';
  options: {
    overwriteFile: boolean;
  };
};

type Format = GsheetFormat | BaseFormat<BaseFormatTypes>;

type Frequency = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter';

export type DeliveryRule = JSONApiDef<
  'deliveryRules',
  {
    createdOn: string;
    dataSources: string[];
    delivery: 'email' | 'none';
    deliveryType: 'report' | 'dashboard';
    failureCount: number;
    format: Format;
    frequency: Frequency;
    isDisabled: boolean;
    lastDeliveredOn: string;
    name: string | null;
    recipients: string[];
    schedulingRules: {
      mustHaveData: boolean;
    };
    updatedOn: string;
    version: '1';
  },
  {
    deliveredItem: BelongsTo<DeliveredItem>;
    owner: BelongsTo<User>;
  }
>;
