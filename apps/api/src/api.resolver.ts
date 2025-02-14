import { Mutation, Resolver } from '@nestjs/graphql';
import { ApiService } from './api.service';
import { Query } from '@nestjs/common';

@Resolver('Api')
export class ApiResolver {
  constructor(private readonly apiService: ApiService) {}
}
