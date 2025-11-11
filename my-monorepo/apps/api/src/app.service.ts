import { Injectable } from '@nestjs/common';
// Ensure your monorepo's tsconfig (tsconfig.base.json) has a path mapping like:
// "compilerOptions": { "paths": { "@repo/shared": ["packages/shared/src/index.ts"] } }
// Also add the shared package as a workspace dependency in apps/api/package.json and run your workspace install/build.
// Then the normal import works:
import { hello } from '@repo/shared/hello';

@Injectable()
export class AppService {
  getHello(): string {
    return hello('NestJS');
  }
}
