import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterGeneralDto } from './dto/register-general.dto';
import { RegisterSupplierDto } from './dto/register-supplier.dto';
import { LoginDto } from './dto/login.dto';
import { getAuthCookie } from './utils/auth-cookie.util';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './types/auth-request.type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register-general')
  async registerGeneral(@Body() dto: RegisterGeneralDto, @Res() res: Response) {
    const user = await this.authService.registerGeneral(dto);
    const { token } = await this.authService.login({
      email: dto.email,
      password: dto.password,
    });

    res.cookie('access_token', token, getAuthCookie());
    return res.status(201).json({
      status: 'success',
      message: 'Successfully registered',
      data: { user },
    });
  }

  @Post('register-supplier')
  async registerSupplier(
    @Body() dto: RegisterSupplierDto,
    @Res() res: Response,
  ) {
    const supplier = await this.authService.registerSupplier(dto);
    const { token } = await this.authService.login({
      email: dto.email,
      password: dto.password,
    });

    res.cookie('access_token', token, getAuthCookie());
    return res.status(201).json({
      status: 'success',
      message: 'Successfully registered supplier',
      data: { supplier },
    });
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const { user, token } = await this.authService.login(dto);

    res.cookie('access_token', token, getAuthCookie());
    return res.json({
      status: 'success',
      message: 'Login successful',
      data: { user },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return {
      status: 'success',
      message: 'Login successful',
      data: { user: req.user },
    };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.json({
      status: 'success',
      message: 'Logged out',
    });
  }
}
