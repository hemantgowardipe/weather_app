// parseInput.js
import nlp from 'compromise';
import nlpDates from 'compromise-dates';

nlp.extend(nlpDates); // Enable .dates() method

export function parseUserInput(input) {
  const doc = nlp(input);

  // Extract date information
  const dates = doc.dates().json();
  const date = dates.length > 0 ? dates[0].text : 'today';

  // Extract location (heuristic: last proper noun or manually after "in")
  let location = '';
  const inIndex = input.toLowerCase().indexOf('in ');
  if (inIndex !== -1) {
    location = input.slice(inIndex + 3).split(' ')[0];
  }

  // Fallback if "in <location>" wasn't found
  if (!location) {
    const places = doc.places().out('text');
    location = places || 'your location'; // fallback
  }

  return {
    location,
    date,
  };
}
