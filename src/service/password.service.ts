import bcrypt from 'bcrypt';

export class PasswordService {
    async hashPassword(password: string): Promise<string>{
        try{
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            return hashPassword;
        } catch(e){
                console.log("Ошибка хэширования пароля: ->", e)
                throw e;
        }
    }

    async verifyPassword(password: string, hashPassword: string): Promise<boolean>{
        try{
            return await bcrypt.compare(password, hashPassword);
        } catch(e){
            console.log("Ошибка верификации пароля: ->", e)
            throw new Error("Ошибка верификации пароля")
        }
    }
}