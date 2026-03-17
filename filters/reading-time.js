module.exports = (content) => {
  if (!content) return '1 min read';
  // Strip HTML tags and count words
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter((w) => w.length > 0).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
};
