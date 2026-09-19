// Pure functions so the matching can be reasoned about (and unit tested) without Ember.

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Turn the "|"-joined list setting into clean phrases.
export function parsePhrases(raw) {
  return String(raw || "")
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
}

// "Label https://example.org" -> { label, url }. The URL is the last token that looks like one,
// so labels may contain commas, dashes and phone numbers freely.
export function parseResources(raw) {
  return String(raw || "")
    .split("|")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?)\s*(https?:\/\/\S+)\s*$/);
      return match
        ? { label: match[1].trim() || match[2], url: match[2] }
        : { label: line, url: null };
    })
    .filter((r) => r.url);
}

// Which phrases appear in the text. Case-insensitive; whole-word when asked, so "die" does not
// fire on "diet". Whitespace inside a phrase matches any run of whitespace.
export function findMatches(text, phrases, { wholeWords = true } = {}) {
  const haystack = String(text || "");
  if (!haystack.trim()) {
    return [];
  }
  return phrases.filter((phrase) => {
    const body = escapeRegExp(phrase).replace(/\s+/g, "\\s+");
    const pattern = wholeWords ? `(?<![\\p{L}\\p{N}_])${body}(?![\\p{L}\\p{N}_])` : body;
    return new RegExp(pattern, "iu").test(haystack);
  });
}
