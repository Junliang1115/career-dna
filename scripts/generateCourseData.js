// This file is generated - do not edit manually
// Run: node scripts/generateCourseData.js

const fs = require('fs');

const data = {
  description: "Malaysian University CS/Computing Course Database — sourced from official university curriculum documents",
  sources: {},
  universities: []
};

fs.writeFileSync('scripts/courseData.json', JSON.stringify(data, null, 2));

const totalCourses = data.universities.reduce(
  (s, u) => s + u.programs.reduce((ss, p) => ss + p.courses.length, 0), 0
);
const totalProgs = data.universities.reduce((s, u) => s + u.programs.length, 0);
console.log('Generated courseData.json:');
data.universities.forEach(u => {
  u.programs.forEach(p => {
    const core = p.courses.filter(c => c.isCore).length;
    const elec = p.courses.filter(c => !c.isCore).length;
    console.log('  ' + u.universityName + ' — ' + p.name + ' (' + p.totalCredits + ' cr): ' + core + ' core + ' + elec + ' electives');
  });
});
console.log('Total: ' + data.universities.length + ' universities, ' + totalProgs + ' programs, ' + totalCourses + ' courses');
