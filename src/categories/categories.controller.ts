import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { MessagePattern } from '@nestjs/microservices';
@ApiTags('Categories')
@Controller('expenses/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @MessagePattern('category.findAll')
  async findAll() {
    return this.categoriesService.findAll();
  }
}
