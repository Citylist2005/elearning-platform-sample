// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { users, courses, ensureInitialized } = require('./data');
const { v4: uuidv4 } = require('uuid');

ensureInitialized();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'elearning-secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static('public'));

// Helper
function authRequired(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  const user = { id: uuidv4(), username, email, password, enrollments: [] };
  users.push(user);
  req.session.userId = user.id;
  res.json({ message: 'Account created', user: { id: user.id, username, email } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.userId = user.id;
  res.json({ message: 'Logged in', user: { id: user.id, username: user.username, email }});
});

app.post('/api/logout', (req,res) => {
  req.session.destroy(()=>{ res.json({ message: 'Logged out' }); });
});

app.get('/api/me', (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  if (!user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: { id: user.id, username: user.username, email: user.email, enrollments: user.enrollments } });
});

app.get('/api/courses', (req, res) => {
  res.json(courses.map(c => ({ id: c.id, title: c.title, seats: c.seats })));
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

app.post('/api/courses/:id/enroll', authRequired, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  const course = courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (course.seats <= 0) return res.status(400).json({ error: 'No seats available' });
  if (user.enrollments.includes(course.id)) return res.status(409).json({ error: 'Already enrolled' });
  user.enrollments.push(course.id);
  course.seats -= 1;
  res.json({ message: 'Enrolled successfully' });
});

app.post('/api/courses/:id/quiz/submit', authRequired, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  const course = courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (!user.enrollments.includes(course.id)) return res.status(403).json({ error: 'Not enrolled' });
  const answers = req.body.answers || [];
  if (!Array.isArray(answers) || answers.length !== course.quiz.questions.length)
    return res.status(400).json({ error: 'Please answer all questions' });

  let score = 0;
  for (let i=0;i<course.quiz.questions.length;i++){
    if (answers[i] === course.quiz.questions[i].correct) score++;
  }
  res.json({ message: 'Quiz submitted', score, total: course.quiz.questions.length });
});

// serve single-page placeholders
app.get('/', (req,res)=> res.sendFile(__dirname + '/public/index.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`E-Learning app running on http://localhost:${PORT}`));
