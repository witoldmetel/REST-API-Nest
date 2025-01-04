import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  signToken(userId: number, email: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, email },
      { expiresIn: '15m', secret: this.config.get<string>('JWT_SECRET') },
    );
  }

  async signup(dto: AuthDto): Promise<{ access_token: string }> {
    // generate the password hash
    const hash = await argon.hash(dto.password);

    //save the user to the database
    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email, password: hash },
      });
      const token = await this.signToken(user.id, user.email);

      // return the saved user
      return { access_token: token };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
    }
  }

  async signin(dto: AuthDto): Promise<{ access_token: string }> {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // if user not found, throw an error
    if (!user) throw new ForbiddenException('Invalid email or password');

    //compare the password hash
    const match = await argon.verify(user.password, dto.password);
    // if password incorrect, throw an error
    if (!match) throw new ForbiddenException('Invalid email or password');

    const token = await this.signToken(user.id, user.email);

    // return the user
    return { access_token: token };
  }
}
