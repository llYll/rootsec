export { NpmPkg } from '@waiting/shared-types';
import { UserContext } from './app/comm/userContext';

declare module '@midwayjs/core' {
  interface Context {
    userContext: UserContext;
  }
}
