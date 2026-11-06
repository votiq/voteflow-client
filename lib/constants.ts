export const POLL_CATEGORIES = [
  'All Categories',
  'Photography',
  'Startup Pitch',
  'UI/UX Design',
  'Non-Profit',
] as const;

export const POLL_PAGE_SIZE = 12;
// Keep offsets below Django Ninja's configured/default maximum offset of 100.
export const POLL_MAX_OFFSET = 100;
