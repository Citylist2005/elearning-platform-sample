// data.js
const { v4: uuidv4 } = require('uuid');

const users = []; // {id, username, email, password, enrollments: []}

const courses = [];

function ensureInitialized() {
  if (courses.length) return;
  courses.push({
    id: 'c-js-01',
    title: 'Intro to JavaScript',
    seats: 10,
    description: 'Basics of JavaScript.',
    quiz: {
      questions: [
        { q: 'What is typeof 1?', choices: ['string','number','boolean'], correct: 1 },
        { q: 'Which keyword declares a variable?', choices: ['let','func','class'], correct: 0 },
        { q: 'Array method to add at end?', choices: ['pop','push','shift'], correct: 1 }
      ]
    }
  });
  courses.push({
    id: 'c-html-01',
    title: 'HTML & CSS',
    seats: 5,
    description: 'Build static web pages.',
    quiz: {
      questions: [
        { q: 'HTML stands for?', choices: ['Hyper Text Markup Language','High Text Markup','Home Tool'], correct: 0 },
        { q: 'CSS stands for?', choices: ['Cascading Style Sheets','Computer Style Sheets','Creative Style Sheets'], correct: 0 }
      ]
    }
  });
}

module.exports = { users, courses, ensureInitialized };
