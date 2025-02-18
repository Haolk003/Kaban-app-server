import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GqlExecutionContext } from '@nestjs/graphql';

export class LocalAuthGuard extends AuthGuard('local') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req }: { req: Request } = ctx.getArgs();
    const args: { input: any } = ctx.getArgs();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    req.body = args.input;
    return req;
  }
}
