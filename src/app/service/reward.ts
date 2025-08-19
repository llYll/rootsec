import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';
import { bigDiv, bigMul } from 'happy-node-utils';
import dayjs = require('dayjs');

import { BaseService } from '../../core/baseService';
import { RewardRecordMapping } from '../mapping/rewardRecord';
import { RewardRecordEntity } from '../entity/rewardRecord';
import { PledgePoolService } from './pledgePool';
import { POOL_STATUS } from '../constant/pool';
import { PledgeRecordMapping } from '../mapping/pledgeRecord';
import { Op, Sequelize } from 'sequelize';
import { PledgeRecordEntity } from '../entity/pledgeRecord';
import { UserAssetService } from './userAsset';
import { ASSET_FIELD } from '../constant/user';
import { PROFIT_TYPE } from '../constant/profit';

@Provide()
export class ProfitService extends BaseService<RewardRecordEntity> {
  @Inject()
  mapping: RewardRecordMapping;

  @Inject()
  pledgePoolService: PledgePoolService;

  @Inject()
  pledgeRecordMapping: PledgeRecordMapping;

  @Inject()
  userAssetService: UserAssetService;

  @Logger()
  logger: ILogger;

  /**
   * 分收益
   */
  async dividendProfit() {
    const { poolIds, poolsObj } = await this._calculationPoolPledge();
    const pledgeRecords = await this._getRewardRecord(poolIds);
    const arr = [];
    for (const item of pledgeRecords) {
      arr.push(this._calculationProfit(item, poolsObj));
    }
    await this.mapping.bulkCreate(arr);
  }

  /**
   * 计算收益分配
   */
  private async _calculationPoolPledge() {
    const pools = await this.pledgePoolService.mapping.findAll({
      status: POOL_STATUS.STARTING,
    });
    const poolIds = pools.map(item => item.poolId);

    const records = await this.pledgeRecordMapping.findAll(
      { poolId: poolIds },
      {
        attributes: [
          'poolId',
          [Sequelize.fn('SUM', Sequelize.col('secAmount')), 'totalSecAmount'],
        ],
        group: ['poolId'],
      }
    );
    const poolPledgeAmountObj = {};

    // 获取质押总金额
    records.forEach(item => {
      poolPledgeAmountObj[item.poolId] = item.totalSecAmount;
    });

    // 重新组成对象
    const poolsObj: any = {};
    pools.forEach(item => {
      const { poolId, totalAmount, coinId, cycle } = item;
      poolsObj[poolId] = {
        poolId,
        secAmount: poolPledgeAmountObj[poolId]
          ? poolPledgeAmountObj[poolId]
          : 0,
        rewardAmount: totalAmount,
        coinId,
        cycle,
      };
    });
    return {
      poolIds,
      poolsObj,
    };
  }

  /**
   * 获取奖励记录
   * @param poolIds
   * @returns
   */
  private async _getRewardRecord(poolIds: number[]) {
    const records = await this.pledgeRecordMapping.findAll({ poolId: poolIds });
    return records;
  }

  /**
   *
   * @param record
   * @param poolInfo
   * @returns
   */
  private _calculationProfit(
    record: PledgeRecordEntity,
    poolInfo: {
      poolId: number;
      secAmount: number;
      rewardAmount: number;
      coinId: number;
      cycle: number;
    }
  ) {
    const { userId, secAmount } = record;
    return {
      poolId: poolInfo.poolId,
      userId,
      coinId: poolInfo.coinId,
      rewardAmount: bigMul(
        bigDiv(secAmount, poolInfo.secAmount),
        poolInfo.rewardAmount
      ).toFixed(4),
      releaseDate: dayjs()
        .add(poolInfo.cycle, 'day')
        .format('YYYY-MM-DD HH:mm:ss'),
      status: 0,
    };
  }

  /**
   * 释放收益
   * @returns
   */
  async releaseProfit() {
    const records = await this.mapping.findAll({
      status: 0,
      releaseDate: {
        [Op.lte]: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
    });
    for (const record of records) {
      await this.sendProfit(record);
    }
    return true;
  }

  async sendProfit(record: RewardRecordEntity) {
    const t = await this.mapping.getTransaction();
    try {
      const { userId, rewardAmount } = record;
      await this.userAssetService.modifyUserAsset({
        userId,
        coinId: record.coinId,
        amount: rewardAmount,
        currency: ASSET_FIELD.BALANCE,
        type: PROFIT_TYPE.REWARD,
        remark: 'reward poool',
        t,
      });
      await record.update({ status: 1 }, { transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
    }
  }
}
