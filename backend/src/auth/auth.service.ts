import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('Este email já está em uso. Use outro ou faça login.');
      }

      const user = await this.usersService.create(name, email, password);
      const payload = { email: user.email, sub: String(user._id) };

      const access_token = this.jwtService.sign(payload);
      if (!access_token) {
        throw new InternalServerErrorException(
          'Configuração do servidor incompleta. Verifique JWT_SECRET no .env.',
        );
      }

      return {
        access_token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      if (error?.code === 11000) {
        throw new BadRequestException('Este email já está em uso. Use outro ou faça login.');
      }
      console.error('Register error:', error);
      const message =
        error?.message?.includes('connect') || error?.message?.includes('MongoNetworkError')
          ? 'Não foi possível conectar ao banco de dados. Verifique se o MongoDB está rodando.'
          : 'Erro ao criar conta. Tente novamente.';
      throw new InternalServerErrorException(message);
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user || !(await this.usersService.validatePassword(user, password))) {
        throw new UnauthorizedException('Email ou senha incorretos.');
      }
      const payload = { email: user.email, sub: String(user._id) };
      const access_token = this.jwtService.sign(payload);
      return {
        access_token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) throw error;
      if (error?.code === 11000) {
        throw new BadRequestException('Este email já está em uso.');
      }
      console.error('Login error:', error);
      const message =
        error?.message?.includes('connect') || error?.message?.includes('MongoNetworkError')
          ? 'Não foi possível conectar ao banco. Verifique se o MongoDB está rodando.'
          : 'Erro ao fazer login. Tente novamente.';
      throw new InternalServerErrorException(message);
    }
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
