import { CreateUserDto, LoginUserDto, UserDto } from "../models/user.model";
import { JwtService } from "./jwt.service";
import { UserValidataionData } from "../middleware/user.middleware";
import { PrismaService } from "./prisma.service";
import { PasswordService } from "./password.service";

const passwordService = new PasswordService();
const userValidataionData = new UserValidataionData();
const jwtService = new JwtService();

export class UserService {
    private prisma = PrismaService.getInstance();

    async createUser( userDto: CreateUserDto ): Promise<UserDto>{
        try{
            const userData = await userValidataionData.validateData(userDto);
            await this.checkEmailUnique(userData.email);
            const hashedPassword = await passwordService.hashPassword(userData.password)

            const user: UserDto = await this.prisma.user.create({
                data: {
                    ...userData,
                    password: hashedPassword
                }
            })
            return user;
        } catch(e){
            console.log(`Ошибка создания пользователя: ${e}`)
            throw e;
        }
    }

    async loginUser(userDto: LoginUserDto){
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    email: userDto.email
                }
            })

            if(!user){
                throw new Error("Пользователя с таким email не существует")
            }
            await passwordService.verifyPassword(userDto.password, user.password)

            const payload = {
                userId: user.id,
                email: user.email,
                role: user.role
            };

            const accessToken =  jwtService.generateAccessToken(payload);
            const refreshToken =  jwtService.generateRefreshToken(payload);

            await jwtService.saveRefreshToken(user.id, refreshToken);

            await this.prisma.user.update({
                where:{ email: user.email },
                data: { status: "ACTIVE"}
            })

            return {
                user: user,
                accessToken,
                refreshToken
            };
        } catch(e){
            console.log("Ошибка авторизации пользователя: ->", e)
            throw e;
        }
    }

    async logout(accessToken: string): Promise<void>{
        try{
            const user = jwtService.decodeToken(accessToken)
            await jwtService.deleteRefreshToken((user?.userId) as number)
        } catch(e){
            console.log("Ошибка выхода из акаунта:->", e)
            throw e;
        }
    }

    async getUser(userId: number){
        try{
            const user = await this.prisma.user.findUnique({
                where:{
                    id: userId
                }
            })

            return user;
        } catch(e){
            console.log("Ошибка получения профиля: ->", e);
            throw e;
        }
    }

    async getUsers(){
        try{
            const users = await this.prisma.user.findMany({
                select: {
                    id: true,
                    fullName: true,
                    birthday: true,
                    email: true
                }
            });
            return users;
        } catch(e){
            console.log("Ошибка получения списка пользователей: ->", e);
            throw e;
        }
    }

    async getUserProfile(userId: number){
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            return user;
        } catch(e){
            console.log("Ошибка получения профиля пользователя: ->", e)
            throw e;
        }
    }

    async blockAccount(userId: number){
        try{
            const user = await this.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    status: "BLOCKED"
                }
            })
            return user;
        } catch(e){
            console.log("Ошибка блокировки аккаунта: ->", e)
            throw e;
        }
    }

    async blockAccountAdmin(userId: number){
        try{
            const user = await this.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    status: "BLOCKED"
                }
            })
            return user;
        } catch(e){
            console.log("Ошибка блокировки аккаунта: ->", e)
            throw e;
        }
    }

    private async checkEmailUnique(email: string): Promise<void>{
        try{
            const user = await this.prisma.user.findUnique({
                where: { email: email }
            })
            if(user){
                throw new Error("Пользователь с таким email уже существует")
            }
        } catch(e){
            console.log("Ошибка проверки на существование пользователя: ->", e);
            throw e;
        }
    }
}