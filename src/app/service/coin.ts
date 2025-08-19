import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';

import { BaseService } from '../../core/baseService';
import { CoinEntity } from '../entity/coin';
import { CoinMapping } from '../mapping/coin';
import { AddCoinDTO } from '../model/dto/coin';
import { QueryParamDTO } from '../model/dto/base';
import { IGetCoinDetail } from '../../interface';

@Provide()
export class CoinService extends BaseService<CoinEntity> {
  @Inject()
  mapping: CoinMapping;

  @Logger()
  logger: ILogger;

  /**
   * 新增货币
   * @param param
   * @returns
   */
  async addCoin(param: AddCoinDTO): Promise<CoinEntity> {
    const { url, name, icon } = param;
    const coin = await this.mapping.saveNew({
      url,
      name,
      icon,
    });
    return coin;
  }

  /**
   * 获取币种列表
   * @param param
   * @returns
   */
  async getList(param: QueryParamDTO) {
    const { page, limit } = param;
    const res = await this.mapping.findAndCountAll(page, limit, {});
    return res;
  }

  /**
   * 获取币详情
   * @param param
   * @returns
   */
  async getCoinDetail(param: IGetCoinDetail) {
    const where = {};
    if (param.coinId) {
      Object.assign(where, { coinId: param.coinId });
    }
    if (param.currency) {
      Object.assign(where, { name: param.currency });
    }
    const coin = await this.mapping.findOne(where);
    return coin;
  }

  /**
   * 获取所有币种
   * @returns
   */
  async getAll(coinName?: string) {
    const where = {};
    if (coinName) {
      Object.assign(where, { name: coinName });
    }
    const res = await this.mapping.findAll(where, {
      raw: true,
    });
    return res;
  }
}
