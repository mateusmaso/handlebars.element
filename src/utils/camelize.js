export default function camelize(string) {
  return string.trim().replace(/[-_\s]+(.)?/g, function(match, word) {
    return word ? word.toUpperCase() : "";
  });
}
