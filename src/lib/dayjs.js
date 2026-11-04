import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export const DATE_FORMAT = 'DD MMM YYYY';
export const DATETIME_FORMAT = 'DD MMM YYYY HH:mm';

export const formatDate = (value, fmt = DATE_FORMAT) =>
  value ? dayjs(value).format(fmt) : '—';

export default dayjs;