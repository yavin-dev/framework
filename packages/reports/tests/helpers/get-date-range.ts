import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import Interval from 'navi-data/utils/classes/interval';
import { getPeriodForGrain, Grain } from 'navi-data/utils/date';
//@ts-ignore
import { formatDateRange } from 'navi-reports/helpers/format-interval-inclusive-inclusive';

/**
 * Formats a string representing the given filter values for an interval input
 * @param filter - The date time filter to serialize
 */
export function getDateRangeFormat(filter: FilterFragment) {
  const [startDate, endDate] = filter.values as string[];
  const timeGrain = filter.parameters.grain as Grain;
  const { start, end } = Interval.parseFromStrings(startDate, endDate).asMomentsForTimePeriod(timeGrain);
  end.subtract(1, getPeriodForGrain(timeGrain));
  return formatDateRange(start, end, timeGrain);
}
