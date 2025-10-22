import { NextFunction, Request, Response } from "express";
import { JwtService } from "../service/jwt.service";

const jwtService = new JwtService();

export class AuthMiddleware{
    async adminGuard(req: Request, res: Response, next: NextFunction){
        try{
            const accessToken = req.cookies.accessToken;
            if(!accessToken){
                return res.status(401).json({
                    success: false,
                    message: "Токен доступа отсутствует"
                })
            }

            const token = jwtService.verifyAccessToken(accessToken);
            if(token.role != "ADMIN"){
                return res.status(403).json({
                    success: false,
                    message: "Отсутствуют права доступа"
                })
            }

            next();
        } catch(accessError: any){
            const accessToken = req.cookies.accessToken;
             if (this.isTokenExpiredError(accessError)) {
                try {
                    // Декодируем истекший токен чтобы получить userId
                    const decoded = jwtService.decodeToken(accessToken);
                    if (!decoded) {
                        throw new Error("Не удалось декодировать токен");
                    }

                    // Получаем refresh token из БД
                    const refreshToken = await jwtService.getRefreshTokenFromDB(decoded.userId);
                    if (!refreshToken) {
                        throw new Error("Refresh token не найден");
                    }

                    // Обновляем токены
                    const newTokens = await jwtService.refreshTokens(refreshToken);
                    
                    // Устанавливаем новый access token в cookie
                    res.cookie('accessToken', newTokens.accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000
                    })
                    
                    // Декодируем новый токен для req.user
                    
                    return next();
                        
                } catch (refreshError) {
                        console.log("Ошибка обновления токена:", refreshError);
                        this.clearAccessTokenCookie(res);
                        return res.status(401).json({
                            success: false,
                            message: "Сессия истекла. Требуется повторная авторизация"
                        });
                    }
             }
        }
    }

    async authGuard(req: Request, res: Response, next: NextFunction){
        try{
            const accessToken = req.cookies.accessToken;
            if(!accessToken){
                return res.status(401).json({
                    success: false,
                    message: "Токен доступа отсутствует"
                })
            }

            const token = jwtService.verifyAccessToken(accessToken);
            if (token.role !== "USER" && token.role !== "ADMIN") {
                return res.status(403).json({
                    success: false,
                    message: "Недостаточно прав"
                });
            }

            next();
        } catch(accessError: any){
            const accessToken = req.cookies.accessToken;
             if (this.isTokenExpiredError(accessError)) {
                try {
                    // Декодируем истекший токен чтобы получить userId
                    const decoded = jwtService.decodeToken(accessToken);
                    if (!decoded) {
                        throw new Error("Не удалось декодировать токен");
                    }

                    // Получаем refresh token из БД
                    const refreshToken = await jwtService.getRefreshTokenFromDB(decoded.userId);
                    if (!refreshToken) {
                        throw new Error("Refresh token не найден");
                    }

                    // Обновляем токены
                    const newTokens = await jwtService.refreshTokens(refreshToken);
                    
                    // Устанавливаем новый access token в cookie
                    res.cookie('accessToken', newTokens.accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000
                    })
                    
                    // Декодируем новый токен для req.user
                    
                    return next();
                        
                } catch (refreshError) {
                        console.log("Ошибка обновления токена:", refreshError);
                        this.clearAccessTokenCookie(res);
                        return res.status(401).json({
                            success: false,
                            message: "Сессия истекла. Требуется повторная авторизация"
                        });
                    }
             }
        }
    }

     private isTokenExpiredError(error: any): boolean {
        return error.message?.includes('истек') || 
               error.name === 'TokenExpiredError' ||
               error.message?.includes('expired');
    }

      private clearAccessTokenCookie(res: Response): void {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    }
}