import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';

import { BaseService } from '../../core/baseService';
import { PledgePoolEntity } from '../entity/pledgePool';
import { PledgePoolMapping } from '../mapping/pledgePool';
import {
  AddPledgePoolDTO,
  GetPoolListDTO,
  ModifyPledgePoolDTO,
} from '../model/dto/pool';
import { ErrorLevelEnum, MyError } from '../comm/myError';
import { POOL_STATUS } from '../constant/pool';

@Provide()
export class PledgePoolService extends BaseService<PledgePoolEntity> {
  @Inject()
  mapping: PledgePoolMapping;

  @Logger()
  logger: ILogger;

  /**
   * 新增质押池
   * @param param
   * @returns
   */
  async addPool(param: AddPledgePoolDTO): Promise<PledgePoolEntity> {
    const pool = await this.mapping.saveNew({
      coinId: param.coinId,
      totalAmount: param.totalAmount,
      leftAmount: param.totalAmount,
      cycle: param.cycle,
      status: POOL_STATUS.INIT,
      startAt: param.startAt,
      endAt: param.endAt,
    });
    return pool;
  }

  /**
   * 获取质押池列表
   * @param param
   * @returns
   */
  async getPoolList(param: GetPoolListDTO) {
    const { page, limit, status } = param;
    const where: any = {};
    if (status) {
      where.status = status;
    }
    const { rows, count } = await this.mapping.findAndCountAll(
      page,
      limit,
      where
    );
    const coinIds = rows.map(item => item.coinId);
    const coins = await this.mapping.findAll({ coinId: coinIds });
    const coinObj = {};
    for (const item of coins) {
      coinObj[item.id] = item;
    }
    const res = rows.map(item => {
      return {
        poolId: item.poolId,
        coinId: item.coinId,
        totalAmount: item.totalAmount,
        leftAmount: item.leftAmount,
        cycle: item.cycle,
        status: item.status,
        startAt: item.startAt,
        endAt: item.endAt,
        coinName: coinObj[item.coinId].name || '',
        icon: coinObj[item.coinId].icon || '',
      };
    });
    return { count, rows: res };
  }

  /**
   * 修改矿池
   * @param param
   * @returns
   */
  async modifyPool(param: ModifyPledgePoolDTO) {
    const { poolId, coinId, totalAmount, cycle, startAt, endAt } = param;

    const poolInfo = await this.mapping.findOne({ poolId });
    if (!poolInfo || poolInfo.status != POOL_STATUS.INIT) {
      throw new MyError('pool not support modify', ErrorLevelEnum.P4);
    }
    const modifyPool = {};

    if (coinId) {
      Object.assign(modifyPool, { coinId });
    }
    if (totalAmount) {
      Object.assign(modifyPool, { totalAmount, leftAmount: totalAmount });
    }
    if (cycle) {
      Object.assign(modifyPool, { cycle });
    }
    if (startAt) {
      Object.assign(modifyPool, { startAt });
    }
    if (endAt) {
      Object.assign(modifyPool, { endAt });
    }
    await this.mapping.modify(modifyPool, { poolId });
    return true;
  }
}
