export interface UserDto{
    id: number;
    fullName: string;
    birthday: Date;
    email: string;
    password: string;
    role: string;
    status: string;
}

export interface CreateUserDto {
    fullName: string;
    birthday: Date;
    email: string;
    password: string;
}

export interface LoginUserDto {
    email: string;
    password: string;
}