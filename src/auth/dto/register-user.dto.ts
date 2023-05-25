import {IsEmail, IsString, MinLength, IsNumber} from 'class-validator';

export class RegisterUserDto {
    @IsEmail()
    email:string;
    @IsString()
    name:string;
    @MinLength(6)
    password:string;
    @IsNumber()
    phone:number;
}