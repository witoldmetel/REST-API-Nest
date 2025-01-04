import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);

    //save the user to the database
    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email, password: hash },
      });

      delete user.password;
      // return the saved user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
    }
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // if user not found, throw an error
    if (!user) throw new ForbiddenException('Invalid email or password');

    //compare the password hash
    const match = await argon.verify(user.password, dto.password);
    // if pssword incorrect, throw an error
    if (!match) throw new ForbiddenException('Invalid email or password');

    delete user.password;
    // return the user
    return user;
  }
}
