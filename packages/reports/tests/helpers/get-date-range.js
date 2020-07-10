import { formatDateRange } from 'navi-reports/helpers/format-interval-inclusive-inclusive';
import { getIsoDateTimePeriod } from 'navi-core/utils/date';

/**
 * Formats a string representing the given filter values for an interval input
 * @param {object} source - The object containing a request and filter operator
 */
export function getDateRangeFormat(source) {
  const dateTimePeriod = source.request.logicalTable.timeGrain;
  const { start, end } = source.filter.values.firstObject.asMomentsForTimePeriod(dateTimePeriod);
  end.subtract(1, getIsoDateTimePeriod(dateTimePeriod));
  return formatDateRange(start, end, dateTimePeriod);
}
