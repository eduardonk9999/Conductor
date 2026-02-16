import { IsString, IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Informe um email válido' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Informe a senha' })
  password: string;
}
