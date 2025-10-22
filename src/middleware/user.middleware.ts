import { CreateUserDto } from "../models/user.model";

export class UserValidataionData{
    async validateData(userDto: CreateUserDto): Promise<CreateUserDto>{
            try{
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(userDto.email)) {
                throw new Error("Неверный формат email");
                }
                if(!userDto.email || !userDto.password || !userDto.birthday || !userDto.fullName){
                    throw new Error("Заполните все поля для регистрации.")
                }
                if(userDto.password.length <= 7){
                    throw new Error("Пароль должен содержать минимум 7 символов.")
                }
                const bday = new Date(userDto.birthday)
    
                if (isNaN(bday.getTime())) {
                    throw new Error("Неверный формат даты рождения.");
                }
                if (bday > new Date()) {
                    throw new Error("Дата рождения не может быть в будущем.");
                }
    
                if (userDto.fullName.length < 2 || userDto.fullName.length > 20) {
                    throw new Error("Имя должно содержать от 2 до 20 символов");
                }
    
                return {
                    fullName: userDto.fullName.trim(),
                    email: userDto.email.trim().toLowerCase(),
                    birthday: bday,
                    password: userDto.password,
                };
            } catch(e){
                console.log("Ошибка валидации данных: ->", e);
                throw e;
            } 
        }
}