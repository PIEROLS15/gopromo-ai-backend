import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

type JwtPayload = {
  sub: number;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: { cookies?: { access_token?: string } }) =>
          req?.cookies?.access_token,
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
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        educationalInstitution: user.educationalInstitution,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      };
    }

    const supplier = await this.prisma.supplier.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (supplier) {
      if (!supplier.active) {
        throw new UnauthorizedException('Supplier account is inactive');
      }

      return {
        id: supplier.id,
        email: supplier.email,
        ruc: supplier.ruc,
        representativeName: supplier.representativeName,
        companyName: supplier.companyName,
        phone: supplier.phone,
        avatar: supplier.avatar,
        active: supplier.active,
        role: supplier.role,
      };
    }

    throw new UnauthorizedException();
  }
}
