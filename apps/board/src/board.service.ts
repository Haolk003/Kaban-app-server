import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardService {
  getHello(): string {
    return 'Hello World!';
  }
}
