import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('expenses/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all expense categories' })
  @ApiResponse({ status: 200, description: 'Returns all categories' })
  async findAll() {
    return this.categoriesService.findAll();
  }
}
