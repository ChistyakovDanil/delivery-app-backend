const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.json());

const secretKey = 'yourSecretKey';

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.get('https://6520469d906e276284c44825.mockapi.io/login');
    const users = response.data;

    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      const token = jwt.sign({ email }, secretKey);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Невірний логін або пароль' });
    }
  } catch (error) {
    console.error('Помилка при отриманні даних із бази даних', error);
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const response = await axios.get('https://6520469d906e276284c44825.mockapi.io/login');
    const users = response.data;

    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      res.status(401).json({ error: 'Користувач з такою адресою електронної пошти вже існує' });
    } else {
      const newUser = { name, email, password };
      const token = jwt.sign({ email, name }, secretKey);
      newUser.token = token;

      const response = await axios.post('https://6520469d906e276284c44825.mockapi.io/login', newUser);
      res.json({ message: 'Користувача успішно зареєстровано', token });
    }
  } catch (error) {
    console.error('Помилка при отриманні/додаванні даних у базу даних', error);
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

app.get('/user', async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Потрібно увійти' });
  }

  const token = authorizationHeader.replace('Bearer ', '');

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ error: 'Помилка аутентифікації' });
    }

    const email = decoded.email;

    axios
      .get('https://6520469d906e276284c44825.mockapi.io/login', {
        params: { email },
      })
      .then((response) => {
        const user = response.data.find((u) => u.email === email);

        if (!user) {
          return res.status(404).json({ error: 'Профіль не знайдено' });
        }

        res.json(user);
      })
      .catch((error) => {
        console.error('Помилка запиту до бази даних', error);
        res.status(500).json({ error: 'Помилка запиту до бази даних' });
      });
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
