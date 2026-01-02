// Fallback typings for CI environments where Prisma's generated
// module resolution can be finicky under `moduleResolution: bundler`.
declare module '@prisma/client' {
  export * from '@prisma/client/.prisma/client';
  export { PrismaClient } from '@prisma/client/.prisma/client';
}
