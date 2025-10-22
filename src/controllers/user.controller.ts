import { Request, Response } from "express";
import { CreateUserDto, LoginUserDto } from "../models/user.model";
import { UserService } from "../service/user.service";
import { JwtService } from "../service/jwt.service";

const userService = new UserService();
const jwtService = new JwtService();

export class UserController {

    async createUser (req: Request, res: Response){
        try{
            const userDto: CreateUserDto = req.body;
            const user = await userService.createUser(userDto)

            return res.status(201).json({
                success: true,
                data: user,
                message: "Пользователь успешно зарегистрирован"
            })
        } catch(e){
            console.error("Ошибка создания пользователя: ->", e)
            return res.status(400).json({
                success: false,
                message: "Ошибка создания пользователя"
            })
        }
    }

    async loginUser(req: Request, res: Response){
        try{
            const userDto: LoginUserDto = req.body;
            const user = await userService.loginUser(userDto);

            res.cookie('accessToken', user.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
            })

           return res.status(200).json({
                success: true,
                data: user,
                message: "Авторизация прошла успешно"
            })
        } catch(e){
            console.error("Ошибка авторизации на стороне сервера: ->", e)
            return res.status(400).json({
                success: false,
                message: "Ошибка авторизации на стороне сервера"
            })
        }
    }

    async logout(req: Request, res: Response){
        try{
            const accessToken = req.cookies.accessToken;
            const token = await userService.logout(accessToken);
            res.clearCookie("accessToken")
            return res.status(200).json({
                success: true,
                data: token,
                message: "Пользователь успешно вышел из аккаунта"
            })
        } catch(e){
            console.log("Ошибка выхода из аккаунта: ->", e)
            return res.status(401).json({
                success: false,
                message: "Ошибка выхода."
            })
        }
    }

    async getUser(req: Request, res: Response){
        try{
            const { userId } = req.body;
            const token = req.cookies.accessToken;

            const tokenDecode = jwtService.verifyAccessToken(token);

            if(userId !== tokenDecode.userId){
                return res.status(403).json({
                            success: false,
                            message: "Нет прав для просмотра этого профиля"
                        });
            }

            const user = await userService.getUser(userId)

            return res.status(200).json({
                    success: true,
                    data: user,
                    message: "Профиль получен успешно"
            })
        } catch(e){
            console.log("Ошибка получения профиля пользователя")
            return res.status(401).json({
                success: false,
                message: "Ошибка получения профиля пользователя"
            })
        }
    }

     async getUsers(_req: Request, res: Response){
         try{
            const user = await userService.getUsers();
            return res.status(200).json({
                success: true,
                data: user,
                message: "Успешно получена информация"
            })
         } catch(e){
            console.log("Ошибка получения профилей пользователей")
            return res.status(401).json({
                 success: false,
                 message: "Ошибка получения профилей пользователей"
             })
         }
     }

     async getUserProfile(req: Request, res: Response){
        try{
            const { userId } = req.body;

            if(!userId){
                return res.status(503).json({
                    success: false,
                    message: "Отсутствует ID пользователя для получения профиля."
                })
            }
            const user = await userService.getUserProfile(userId)
            return res.status(200).json({
                success: true,
                data: user,
                message: "Профиль успешно получен"
            })
        } catch(e){
            console.log("Ошибка получения профиля пользователя: ->", e);
            return res.status(401).json({
                 success: false,
                 message: "Ошибка получения профилей пользователей"
             })
        }
     }


    async blockAccount(req: Request, res: Response){
        try{
            const token = req.cookies.accessToken;
            if(!token){
                return res.status(501).json({
                    success: false,
                    message: "Отсутствует токен доступа"
                })
            }

            const tokenDecode = jwtService.verifyAccessToken(token);
            await userService.blockAccount(tokenDecode.userId)

            return res.status(200).json({
                    success: true,
                    message: "Профиль успешно заблокирован"
            })
        } catch(e){
            console.log("Ошибка блокировки аккаунта")
            return res.status(401).json({
                success: false,
                message: "Ошибка блокировки аккаунта"
            })
        }
    }

    async blockAccountAdmin(req: Request, res: Response){
        try{
            const { userId } = req.body;

            await userService.blockAccountAdmin(userId);

            return res.status(200).json({
                    success: true,
                    message: "Профиль успешно заблокирован"
            })
        } catch(e){
            console.log("Ошибка блокировка аккаунта: ->", e)
            return res.status(501).json({
                success: false,
                message: "Ошибка блокировки аккаунта."
            })
        }
    }
}