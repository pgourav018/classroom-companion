async function parseAssignment(message) {

  // VERY SIMPLE LOCAL PARSER

  const words = message.split(" ");

  const studentName = words[1];

  // Find "due in X days"
  const dueMatch = message.match(/due in (\d+) days/i);

  const dueDays = dueMatch
    ? parseInt(dueMatch[1])
    : 3;

  // Remove Assign + student name + due text
  const assignment = message
    .replace(/^Assign\s+\w+\s+/i, "")
    .replace(/due in \d+ days/i, "")
    .trim();

  return {
    studentName,
    assignment,
    dueDays,
  };
}

module.exports = parseAssignment;