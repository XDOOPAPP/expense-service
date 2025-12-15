import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Auth } from '../common/decorators/auth.decorator';
import { MessagePattern } from '@nestjs/microservices';
@ApiTags('Categories')
@Controller('expenses/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @MessagePattern('category.findAll')
  @Auth()
  async findAll() {
    return this.categoriesService.findAll();
  }
}
