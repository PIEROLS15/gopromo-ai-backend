import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateContactDto) {
    const contact = await this.contactService.create(dto);

    return {
      status: 'success',
      message: 'Contact created successfully',
      data: contact,
    };
  }

  @Get()
  async findAll() {
    return this.contactService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () => ({
          statusCode: 400,
          status: 'error',
          message: 'Invalid contact ID format',
        }),
      }),
    )
    id: number,
  ) {
    return this.contactService.findOne(id);
  }
}
