import jwt from "jsonwebtoken";
import { JWT_CONFIG, payloadDto } from "../models/jwt.config";
import { PrismaService } from "./prisma.service";

export class JwtService{
    private prisma = PrismaService.getInstance();

    generateAccessToken(payload: payloadDto): string {
        try{
            return jwt.sign(payload, JWT_CONFIG.secret, {
                expiresIn: "15d"
            });
        } catch(e){
            console.log("Ошибка генерации AccessToken: ->", e)
            throw new Error("Ошибка генерации AccessToken")
        }
  }

  generateRefreshToken(payload: payloadDto): string {
    try{
        return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
            expiresIn: "30d"
        });
    } catch(e){
        console.log("Ошибка генерации RefreshToken: ->", e)
        throw new Error("Ошибка генерации RefreshToken")
    }
  }

  verifyAccessToken(token: string): payloadDto {
    try{
        if (!token) {
            throw new Error("Токен отсутствует");
        }
        return jwt.verify(token, JWT_CONFIG.secret) as payloadDto
    } catch(e){
        console.log("Ошибка верификации AccessToken: ->", e)
        throw new Error("Недействительный Access token")
    }
  }

  verifyRefreshToken(token: string): payloadDto {
    try {
        if (!token) {
            throw new Error("Токен отсутствует");
        }
        return jwt.verify(token, JWT_CONFIG.refreshSecret) as payloadDto;
    } catch (e) {
        console.log("Ошибка верификации RefreshToken: ->", e)        
        throw new Error('Недействительный Refresh token');
    }
  }

   decodeToken(token: string): payloadDto | null {
    try {
      return jwt.decode(token) as payloadDto;
    } catch (error) {
      return null;
    }
  }

  async saveRefreshToken(userId: number, refreshToken: string){
    try{
       await this.prisma.tokens.upsert({
        where: {
            userId: userId
        },
        update: {
            refreshToken: refreshToken,
        },
        create: {
            userId: userId,
            refreshToken: refreshToken
        }});
    } catch(e){
        console.log("Ошибка сохранения токена в БД: ->", e)
        throw new Error("Ошибка сохранения токена в БД")
    }
  }

  async deleteRefreshToken(userId: number){
    await this.prisma.tokens.update({
                where: {userId: (userId) as number},
                data: {refreshToken: ""}
            })
  }

  async getRefreshTokenFromDB(userId: number): Promise<string | null>{
    try{
        const token = await this.prisma.tokens.findUnique({
            where:{ userId: userId },
            select: { refreshToken: true }
        });
        return token?.refreshToken || null;
    } catch(e){
        console.log("Ошибка получения refresh token из БД:", e);
        return null;
    }
  }

  async refreshTokens(refreshToken: string): Promise<{ 
        accessToken: string; 
        refreshToken: string 
    }> {
        try {
            if (!refreshToken) {
                throw new Error("Refresh token отсутствует");
            }

            // Верифицируем refresh token
            const decoded = this.verifyRefreshToken(refreshToken);
            
            // Проверяем что refresh token совпадает с сохраненным в БД
            const storedToken = await this.getRefreshTokenFromDB(decoded.userId);
            if (!storedToken || storedToken !== refreshToken) {
                // Если токен не совпадает - возможно, он был скомпрометирован
                await this.deleteRefreshToken(decoded.userId);
                throw new Error("Refresh token недействителен");
            }
            
            // Создаем payload для новых токенов
            const payload = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
            
            // Генерируем новую пару токенов
            const newAccessToken = this.generateAccessToken(payload);
            const newRefreshToken = this.generateRefreshToken(payload);
            
            // Сохраняем новый refresh token в БД (заменяем старый)
            await this.saveRefreshToken(decoded.userId, newRefreshToken);
            
            return { 
                accessToken: newAccessToken, 
                refreshToken: newRefreshToken 
            };
            
        } catch (error) {
            console.log("Ошибка обновления токенов:", error);
            throw new Error("Не удалось обновить токены");
        }
    }
}