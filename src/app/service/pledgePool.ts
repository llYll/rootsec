import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';
import { Op } from 'sequelize';

import { BaseService } from '../../core/baseService';
import { PledgePoolEntity } from '../entity/pledgePool';
import { PledgePoolMapping } from '../mapping/pledgePool';
import {
  AddPledgePoolDTO,
  GetPoolListDTO,
  ModifyPledgePoolDTO,
  PledgePoolDTO,
} from '../model/dto/pool';
import { ErrorLevelEnum, MyError } from '../comm/myError';
import { POOL_STATUS } from '../constant/pool';
import { UserAssetService } from './userAsset';
import { ASSET_FIELD } from '../constant/user';
import { PROFIT_TYPE } from '../constant/profit';
import { PledgeRecordMapping } from '../mapping/pledgeRecord';
import { PledgeRecordEntity } from '../entity/pledgeRecord';
import { RewardRecordMapping } from '../mapping/rewardRecord';
import { bigAdd } from 'happy-node-utils';

@Provide()
export class PledgePoolService extends BaseService<PledgePoolEntity> {
  @Inject()
  mapping: PledgePoolMapping;

  @Inject()
  userAssetService: UserAssetService;

  @Inject()
  pledgeRecordMapping: PledgeRecordMapping;

  @Inject()
  rewardRecordMapping: RewardRecordMapping;

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
        iPledgeAmount: 0,
        iRewardAmount: 0,
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

  /**
   * 用户奖池列表
   * @param param
   * @returns
   */
  async userPoolList(param: GetPoolListDTO) {
    const userId = this.ctx.userContext.userId;
    const { rows, count } = await this.getPoolList(param);
    const poolId = rows.map(item => item.poolId);
    const pledgeRecords = await this.pledgeRecordMapping.findAll({
      userId,
      poolId,
    });
    const rewardRecords = await this.rewardRecordMapping.findAll({
      userId,
      poolId,
    });
    for (const pledgeRecord of pledgeRecords) {
      const { secAmount, poolId } = pledgeRecord;
      const poolInfo = rows.find(item => item.poolId == poolId);
      poolInfo.iPledgeAmount = bigAdd(
        poolInfo.iPledgeAmount,
        secAmount
      ).toNumber();
    }

    for (const rewardRecord of rewardRecords) {
      const { rewardAmount, poolId } = rewardRecord;
      const poolInfo = rows.find(item => item.poolId == poolId);
      poolInfo.iRewardAmount = bigAdd(
        poolInfo.iRewardAmount,
        rewardAmount
      ).toNumber();
    }
    return {
      rows,
      count,
    };
  }

  /**
   * 改变状态
   */
  async changeStatus() {
    await this._startPool();
    await this._endPool();
  }

  async buyPledgePool(param: PledgePoolDTO) {
    const userId = this.ctx.userContext.userId;
    const { poolId, pledgeAmount } = param;
    const pool = await this.mapping.findOne({ poolId });
    if (!pool || pool.status != POOL_STATUS.STARTING) {
      throw new MyError('pledge pool no support pledge', ErrorLevelEnum.P4);
    }
    const secAmount = await this.userAssetService.getUserSecAmount(userId);
    if (secAmount.balance < pledgeAmount) {
      throw new MyError('sec balance not enough', ErrorLevelEnum.P4);
    }
    const t = await this.mapping.getTransaction();
    try {
      await this.userAssetService.modifyUserAsset({
        userId,
        coinId: secAmount.coinId,
        amount: -pledgeAmount,
        currency: ASSET_FIELD.BALANCE,
        type: PROFIT_TYPE.PLEDGE,
        remark: 'pledge amount',
        t,
      });
      await this.userAssetService.modifyUserAsset({
        userId,
        coinId: secAmount.coinId,
        amount: pledgeAmount,
        currency: ASSET_FIELD.PLEDGE,
        type: PROFIT_TYPE.PLEDGE,
        remark: 'pledge amount',
        t,
      });
      await this.pledgeRecordMapping.saveNew(
        {
          userId,
          poolId,
          secAmount: pledgeAmount,
          startAt: new Date(),
          status: POOL_STATUS.STARTING,
          endAt: pool.endAt,
        },
        { transaction: t }
      );
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
    return true;
  }

  /**
   * 释放奖池
   * @returns
   */
  async releasePool() {
    const records = await this.pledgeRecordMapping.findAll({
      status: POOL_STATUS.STARTING,
      endAt: { [Op.lte]: new Date() },
    });
    for (const record of records) {
      await this._releaseRecord(record);
    }
    return true;
  }

  /**
   * 释放奖励
   * @param item
   */
  private async _releaseRecord(item: PledgeRecordEntity) {
    const { userId, secAmount } = item;
    const secCoin = await this.userAssetService.getUserSecAmount(userId);
    const t = await this.mapping.getTransaction();
    try {
      await this.userAssetService.modifyUserAsset({
        userId,
        coinId: secCoin.coinId,
        amount: secAmount,
        currency: ASSET_FIELD.BALANCE,
        type: PROFIT_TYPE.RELEASE,
        remark: 'release pledge amount',
        t,
      });
      await this.userAssetService.modifyUserAsset({
        userId,
        coinId: secCoin.coinId,
        amount: -secAmount,
        currency: ASSET_FIELD.PLEDGE,
        type: PROFIT_TYPE.RELEASE,
        remark: 'release pledge amount',
        t,
      });
      await item.update({ status: POOL_STATUS.ENDING }, { transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  private async _startPool() {
    const pools = await this.mapping.findAll({
      status: POOL_STATUS.INIT,
      startAt: { [Op.lte]: new Date() },
      endAt: { [Op.gte]: new Date() },
    });
    const poolIds = pools.map(item => item.poolId);
    await this.mapping.modify(
      { status: POOL_STATUS.STARTING },
      { poolId: poolIds }
    );
  }

  private async _endPool() {
    const pools = await this.mapping.findAll({
      status: POOL_STATUS.STARTING,
      endAt: { [Op.lte]: new Date() },
    });
    const poolIds = pools.map(item => item.poolId);
    await this.mapping.modify(
      { status: POOL_STATUS.ENDING },
      { poolId: poolIds }
    );
  }
}
