export { NpmPkg } from '@waiting/shared-types';
import { UserContext } from './app/comm/userContext';
import { CoinEntity } from './app/entity/coin';

declare module '@midwayjs/core' {
  interface Context {
    userContext: UserContext;
  }
}

export interface IGetCoinDetail {
  userId?: number;
  coinId?: number;
  currency?: string;
}

export interface IModifyAsset {
  coinId: number;
  amount: number;
  type: number;
  userId: number;
  currency: string;
  remark: string;
  t: any;
}

export interface IAddProfitDTO {
  userId: number;
  coin: CoinEntity;
  currency: string;
  type: number;
  amount: number;
  remark: string;
  t: any;
}
