const { get } = require("mongoose");
const User = require("../models/User");
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}
module.exports.users_get = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render('usoers', { users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports.login_get = (req, res) => {
  res.render('login');
}



module.exports.signup_post = async (req, res) => {
  const { email, password, f_name, s_name, country, image, age, role,gender } = req.body;
  const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendEmail(to, subject, text) {
  try {
    let info = await transporter.sendMail({
      from: `"Admin 👻" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Message sent: %s", info.messageId);
    return info.messageId;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error; // перебросить ошибку для обработки её в том месте, где вызывается эта функция
  }
}

  try {
    const user = await User.create({ email, password, f_name, s_name, country, image, age, role,gender });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

    // Отправка письма с подтверждением
    const subject = "Регистрация завершена";
    const text = "Вы успешно зарегистрировались на нашем сайте. Спасибо!";
    await sendEmail(email, subject, text);

    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}
module.exports.profile_get = (req, res) => {
  res.render('profile');
}


async function getAllUsers() {
  try {
    const users = await User.find();
    return users;
  } catch (err) {
    throw new Error('Error fetching users: ' + err.message);
  }
}




module.exports.users_get = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render('users', { users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOneUser(pk) {
  try {
    const user = await User.findOne({ _id: pk });
    return user;
  } catch (err) {
    throw new Error('Error fetching user: ' + err.message);
  }
}

module.exports.user_get = async (req, res) => {
  try {
    const pk = req.params.pk; // Получаем идентификатор пользователя из параметра маршрута
    const oneuser = await getOneUser(pk); // Вызываем функцию для получения одного пользователя
    res.render('user', { oneuser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}




module.exports.profile_post = async (req, res) => {
  
  try {
    const { f_name, s_name, country, image ,id} = req.body;
    await User.updateOne({ _id: id}, { f_name, s_name, country, image }); // Используйте updateOne для обновления одного документа

    res.redirect('profile');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.user_delete = async (req, res) => {
  
    try {
      const id = req.body.id;
      console.log(id)
      await User.deleteOne({ _id: id }); // Удаление пользователя по его ID
  
      res.redirect('users'); // Перенаправление пользователя на профиль после успешного удаления
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  
  

  module.exports.random_get = async (req, res) => {
    const axios = require('axios');
    try {
      const cocktails = [];
      for (let i = 0; i < 3; i++) {
        const response = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/random.php');
        const cocktailData = response.data.drinks[0];
        cocktails.push(cocktailData); // Добавляем данные о коктейле в массив
      }
      res.render('cocktails', { cocktails }); // Отправляем массив данных о коктейлях на страницу для отображения
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  

  module.exports.randomMeal_get = async (req, res) => {
    const axios = require('axios');
    try {
      const meals = [];
      for (let i = 0; i < 12; i++) {
        const response = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
        const mealData = response.data.meals[0];
        meals.push(mealData); // Добавляем данные о блюде в массив
      }
      res.render('home', { meals }); // Отправляем массив данных о блюдах на страницу для отображения
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  