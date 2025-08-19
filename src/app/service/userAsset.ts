import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';

import { BaseService } from '../../core/baseService';
import { UserAssetEntity } from '../entity/userAsset';
import { UserAssetMapping } from '../mapping/userAsset';
import { CoinService } from './coin';
import { IAddProfitDTO, IModifyAsset } from '../../interface';
import { ASSET_FIELD } from '../constant/user';
import { UserProfitMapping } from '../mapping/userProfit';
import { UserAssetInfoDTO, UserProfitDTO } from '../model/dto/user';

@Provide()
export class UserAssetService extends BaseService<UserAssetEntity> {
  @Inject()
  mapping: UserAssetMapping;

  @Inject()
  coinService: CoinService;

  @Inject()
  userProfitMapping: UserProfitMapping;

  @Logger()
  logger: ILogger;

  /**
   * 获取用户资产
   * @param userId
   * @returns
   */
  async getUserAsset(userParam: UserAssetInfoDTO) {
    const { uid, coinName } = userParam;
    const userId = uid ? uid : this.ctx.userContext.userId;
    const coinList = await this.coinService.getAll(coinName);
    const param = { userId };
    const userAsset = await this.mapping.findAll(param);
    const res = coinList.map(item => {
      const asset = userAsset.find(x => x.coinId === item.coinId);
      return {
        ...item,
        balance: asset ? asset.balance : 0,
        pledge: asset ? asset.pledge : 0,
      };
    });

    // 金额大小排序
    const userAssets = res.sort((a, b) => {
      return b.balance + b.pledge - (a.balance + a.pledge);
    });
    return userAssets;
  }

  async getUserAssetOneCoin(userId: number, coinId: number) {
    const asset = await this.mapping.findOne({ userId, coinId });
    return asset;
  }

  /**
   *
   * @param param
   * @returns
   */
  async modifyUserAsset(param: IModifyAsset) {
    const { coinId, amount, type, userId, currency, remark, t } = param;
    const coin = await this.coinService.getCoinDetail({ coinId });

    let asset = await this.mapping.findOne({
      userId,
      coinId: coin.coinId,
    });
    if (!asset) {
      asset = await this.mapping.saveNew({
        userId,
        coinId,
        balance: 0,
        pledge: 0,
        freezeBalance: 0,
      });
    }
    const field = {};
    if (currency == ASSET_FIELD.BALANCE) {
      Object.assign(field, { balance: amount });
    }
    if (currency == ASSET_FIELD.PLEDGE) {
      Object.assign(field, { pledge: amount });
    }
    if (currency == ASSET_FIELD.FREEZE_BALANCE) {
      Object.assign(field, { freezeBalance: amount });
    }
    // 变更资产
    await this.mapping.increment(field, { userId, coinId }, { transaction: t });
    await this.addUserProfit({
      userId,
      coin,
      currency,
      type,
      amount,
      remark,
      t,
    });
    return;
  }

  /**
   * 新增用户流水
   * @param param
   * @returns
   */
  async addUserProfit(param: IAddProfitDTO) {
    const { userId, coin, currency, type, amount, remark, t } = param;
    await this.mapping.saveNew(
      {
        userId,
        coinId: coin.coinId,
        currency,
        coinName: coin.name,
        type,
        amount,
        remark,
      },
      { transaction: t }
    );
    return;
  }

  /**
   * 流水列表
   * @param param
   * @returns
   */
  async getUserProfit(param: UserProfitDTO) {
    const userId = this.ctx.userContext.userId;
    const { page, limit, coinName, type } = param;
    const where = {};
    if (userId) {
      Object.assign(where, { userId });
    }
    if (coinName) {
      Object.assign(where, { coinName });
    }
    if (type) {
      Object.assign(where, { type });
    }
    const res = await this.userProfitMapping.findAndCountAll(
      page,
      limit,
      where
    );
    return res;
  }

  async getUserSecAmount(userId: number) {
    const record = await this.coinService.getCoinDetail({ currency: 'sec' });
    const asset = await this.mapping.findOne({
      userId,
      coinId: record.coinId,
    });
    if (!asset) {
      return this.mapping.saveNew({
        userId,
        coinId: record.coinId,
        balance: 0,
        pledge: 0,
        freezeBalance: 0,
      });
    }
    return asset;
  }
}
