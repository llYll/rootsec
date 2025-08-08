import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';

import { BaseService } from '../../core/baseService';
import { CoinEntity } from '../entity/coin';
import { CoinMapping } from '../mapping/coin';
import { AddCoinDTO } from '../model/dto/coin';
import { QueryParamDTO } from '../model/dto/base';

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
}
