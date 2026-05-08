// Country dial codes used for auto-prefixing recipient numbers.
// Add more entries as needed.
export const COUNTRIES = [
  { code: 'LK', name: 'Sri Lanka', dial: '94', flag: '🇱🇰' },
  { code: 'IN', name: 'India', dial: '91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dial: '1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '44', flag: '🇬🇧' },
  { code: 'AE', name: 'UAE', dial: '971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial: '966', flag: '🇸🇦' },
  { code: 'AU', name: 'Australia', dial: '61', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', dial: '1', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', dial: '49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '33', flag: '🇫🇷' },
  { code: 'PK', name: 'Pakistan', dial: '92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dial: '880', flag: '🇧🇩' },
  { code: 'PH', name: 'Philippines', dial: '63', flag: '🇵🇭' },
  { code: 'MY', name: 'Malaysia', dial: '60', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', dial: '65', flag: '🇸🇬' },
  { code: 'ID', name: 'Indonesia', dial: '62', flag: '🇮🇩' },
];

// Normalize a raw input number into E.164 (with leading +).
// Rules:
//   - Strip all whitespace, dashes, brackets.
//   - If starts with '+', keep digits after it.
//   - Else if starts with '00', strip those (00CC... → CC...).
//   - Else if starts with '0', drop the trunk prefix and prepend the country dial.
//   - Else if already begins with the chosen country's dial code, keep as-is.
//   - Else prepend the country dial.
// Returns string like "+94771234567" or "" for invalid.
export function normalizeNumber(raw, dialCode = '94') {
  if (raw == null) return '';
  let s = String(raw).replace(/[\s\-()._]/g, '');
  if (!s) return '';
  let hadPlus = false;
  if (s.startsWith('+')) { hadPlus = true; s = s.slice(1); }
  if (!/^\d+$/.test(s)) return '';

  if (hadPlus) {
    // Already E.164
  } else if (s.startsWith('00')) {
    s = s.slice(2);
  } else if (s.startsWith('0')) {
    s = dialCode + s.slice(1);
  } else if (!s.startsWith(dialCode)) {
    s = dialCode + s;
  }

  if (s.length < 8 || s.length > 15) return '';
  return '+' + s;
}
