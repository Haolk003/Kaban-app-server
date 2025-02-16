import { Mutation, Resolver, Query } from '@nestjs/graphql';
import { ApiService } from './api.service';

@Resolver('Api')
export class ApiResolver {
  constructor(private readonly apiService: ApiService) {}

  @Query(() => String)
  hello() {
    return 'hello';
  }
}
