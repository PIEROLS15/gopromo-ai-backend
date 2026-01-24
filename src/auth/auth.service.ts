import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterGeneralDto } from './dto/register-general.dto';
import { RegisterSupplierDto } from './dto/register-supplier.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, comparePassword } from './utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async registerGeneral(dto: RegisterGeneralDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('The email is already registered');
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        educationalInstitution: dto.educationalInstitution,
        phone: dto.phone,
        password: await hashPassword(dto.password),
        roleId: 3,
      },
      include: { role: true },
    });
  }

  async registerSupplier(dto: RegisterSupplierDto) {
    if (
      await this.prisma.supplier.findUnique({ where: { email: dto.email } })
    ) {
      throw new ConflictException('The email is already registered');
    }

    if (await this.prisma.supplier.findUnique({ where: { ruc: dto.ruc } })) {
      throw new ConflictException('The RUC is already registered');
    }

    return this.prisma.supplier.create({
      data: {
        email: dto.email,
        ruc: dto.ruc,
        representativeName: dto.representativeName,
        companyName: dto.companyName,
        phone: dto.phone,
        password: await hashPassword(dto.password),
        roleId: 2,
        active: true,
      },
      include: { role: true },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    const supplier = !user
      ? await this.prisma.supplier.findUnique({
          where: { email: dto.email },
          include: { role: true },
        })
      : null;

    if (!user && !supplier) {
      throw new NotFoundException('User not found with the provided email');
    }

    const entity = user ?? supplier!;

    if ('active' in entity && !entity.active) {
      throw new UnauthorizedException('Supplier account is inactive');
    }

    const isValid = await comparePassword(dto.password, entity.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwt.sign({
      sub: entity.id,
      role: entity.role.name,
    });

    const responseUser =
      'educationalInstitution' in entity
        ? {
            id: entity.id,
            email: entity.email,
            fullName: entity.fullName,
            educationalInstitution: entity.educationalInstitution,
            phone: entity.phone,
            avatar: entity.avatar,
            role: entity.role,
          }
        : {
            id: entity.id,
            email: entity.email,
            companyName: entity.companyName,
            phone: entity.phone,
            avatar: entity.avatar,
            role: entity.role,
          };

    return {
      user: responseUser,
      token,
    };
  }
}
