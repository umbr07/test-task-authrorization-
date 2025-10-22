import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

// -- Public Route --
router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/logout', userController.logout)

// -- Protected Route --
router.get('/user', authMiddleware.authGuard, userController.getUser)  // Пользователь получает свой профиль по ID
router.get('/users', authMiddleware.adminGuard, userController.getUsers)  // Получает список пользователей
router.get('/user/profile', authMiddleware.adminGuard, userController.getUserProfile ) // Админ получает профиль пользователя по ID
router.put('/blocked', authMiddleware.authGuard, userController.blockAccount)  // Деактивирует аккаунт пользователя USER
router.put('/block', authMiddleware.authGuard, userController.blockAccountAdmin)  // Деактивирует аккаунт пользователя ADMIN

export default router;

