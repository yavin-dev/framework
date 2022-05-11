import { find, findAll } from '@ember/test-helpers';

export const DATE_FORMAT = 'MM/DD/YYYY - hh:mm:ss A';

export function getStatus(elem = find('.data-availability__status') as HTMLElement) {
  const classToStatus = <const>{
    'status-success': 'ok',
    'status-warning': 'delayed',
    'status-danger': 'late',
    'grey-500': 'unavailable',
  };
  const classes = elem.className;
  const result = Object.entries(classToStatus).find((category) => classes.includes(category[0])) ?? [];
  return result[1] ?? 'unknown';
}

export function getDataSourceStatuses() {
  const rows = findAll('.data-availability__row');
  return rows.map((row) => {
    const status = getStatus(row.querySelector('.data-availability__indicator') as HTMLElement);
    const name = row.querySelector('.data-availability__info__name')?.textContent?.trim();
    const date = row.querySelector('.data-availability__info__date')?.textContent?.trim();
    return { status, name, date };
  });
}
