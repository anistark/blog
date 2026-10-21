// Swaps a post page's "on October 24, 2026" for "yesterday", "2 weeks ago" and
// so on. Without JS the exact date stays, and it's always in the tooltip.
// Browsers without Intl.RelativeTimeFormat get dayjs from the CDN instead.

const DAYJS = 'https://unpkg.com/dayjs@1.11.13';
const UNITS = [['year', 365], ['month', 30], ['week', 7], ['day', 1]];

const intlFormat = () => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return (published, days) => {
    const [unit, size] = UNITS.find(([, size]) => days >= size) || UNITS[UNITS.length - 1];
    return rtf.format(-Math.floor(days / size), unit);
  };
};

const dayjsFormat = async () => {
  for (const file of ['dayjs.min.js', 'plugin/relativeTime.js']) {
    const script = document.createElement('script');
    script.src = `${DAYJS}/${file}`;
    document.head.append(script);
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
  }
  window.dayjs.extend(window.dayjs_plugin_relativeTime);
  return (published, days) => (days === 0 ? 'today' : window.dayjs(published).fromNow());
};

export const handleRelativeDates = async () => {
  const times = document.querySelectorAll('time.relative-date');
  if (!times.length) return;

  let format;
  try {
    format = window.Intl && Intl.RelativeTimeFormat ? intlFormat() : await dayjsFormat();
  } catch (error) {
    return; // the exact dates are already on the page
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const time of times) {
    // Read the date as a local calendar day, so "yesterday" matches the reader's clock.
    const published = new Date(`${time.getAttribute('datetime')}T00:00`);
    const days = Math.round((today - published) / 86400000);

    // Future dates (scheduled or draft posts) keep the exact date.
    if (days >= 0) time.textContent = format(published, days);
  }
};
