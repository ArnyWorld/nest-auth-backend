import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcryptjs from "bcryptjs";

// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
// import { LoginDto } from './dto/login.dto';
// import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';
import {JwtService} from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

import { LoginDto, CreateUserDto, UpdateAuthDto, RegisterUserDto } from './dto';

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService){

  }

async  login(loginDto: LoginDto):Promise<LoginResponse>{
    const {email, password } = loginDto;
    const user = await this.userModel.findOne({email})

    if(!user){
      throw new UnauthorizedException('Not valid credentials - email')
    }
    if(!bcryptjs.compareSync(password, user.password)){
      throw new UnauthorizedException('Not valid credentials - password')
    }

    const {password:_, ...rest } = user.toJSON();
    return {
      user: rest,
      token: this.getJwtToken({id:user.id})
    };

    /**
     * User {_id, name, email, rol[]}
     * Token => ASDASDSADasda123das
     * 
     * 
     */
  }

  async register(registerDto: RegisterUserDto):Promise<LoginResponse>{
    const user = await this.create(registerDto);

    return {
      user,
      token:this.getJwtToken({id:user._id})
    }
  }

  async create(createUserDto: CreateUserDto):Promise<User> {
    // console.log(createUserDto);
    // const newUser = new this.userModel(createUserDto);
    // return newUser.save();
    //1 Encriptar la contraseña
    //2 Guardar el usuario
    // General el JWT

    try {
      // const newUser = new this.userModel(createUserDto);
      // return await newUser.save();
      const {password, ...userData} = createUserDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10), ...userData
      });
      await newUser.save();
      const {password:_, ...user} = newUser.toJSON();
      return user;


    } catch (error) {
      if(error.code === 11000){
        throw new BadRequestException(`${createUserDto.email} already exists!`)
      }
      throw new InternalServerErrorException("Something terrible happen!")
    }
  }



  findAll():Promise<User[]>{
    return this.userModel.find();
  }

  findOne(id: number) {
    return `this.userModel.findById(id)`;
  }
  async findUserById(id:string){
    const user = await this.userModel.findById(id);
    const {password, ...rest} = user.toJSON();
    return rest;
  }


  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload:JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }
}
