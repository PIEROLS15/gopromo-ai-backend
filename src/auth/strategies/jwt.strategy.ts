import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

type JwtPayload = {
  sub: number;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          if (!req || !req.cookies) {
            return null;
          }

          const token = req.cookies['access_token'];
          return typeof token === 'string' ? token : null;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (user) {
      return user;
    }

    const supplier = await this.prisma.supplier.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (supplier) {
      return supplier;
    }

    throw new UnauthorizedException();
  }
}
