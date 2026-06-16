import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  findAll() {
    return {
      message: 'Categories endpoint is working',
      data: [],
    };
  }
}
