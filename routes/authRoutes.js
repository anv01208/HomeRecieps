const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.get('/profile',authController.profile_get)
router.get('/users',authController.users_get)
router.get('/users/:pk',authController.user_get),
router.post('/profile',authController.profile_post)
router.post('/delete',authController.user_delete)
router.get('/cocktails',authController.random_get)
router.get('/',authController.randomMeal_get)


module.exports = router;