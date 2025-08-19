import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';

import { BaseService } from '../../core/baseService';
import { WithdrawEntity } from '../entity/withdraw';
import { WithdrawMapping } from '../mapping/withdraw';
import { ApplyWithdrawDTO } from '../model/dto/user';
import { UserAssetService } from './userAsset';
import { ErrorLevelEnum, MyError } from '../comm/myError';
import { UserService } from './user';
import {
  ASSET_FIELD,
  VERIFY_CODE_TYPE,
  WITHDRAW_STATUS,
} from '../constant/user';
import { CoinService } from './coin';
import { PROFIT_TYPE } from '../constant/profit';

@Provide()
export class WithdrawService extends BaseService<WithdrawEntity> {
  @Inject()
  mapping: WithdrawMapping;

  @Inject()
  assetService: UserAssetService;

  @Inject()
  coinService: CoinService;

  @Inject()
  userService: UserService;

  @Logger()
  logger: ILogger;

  /**
   * 申请提现
   * @param param
   * @returns
   */
  async applyWithdraw(param: ApplyWithdrawDTO) {
    const userId = this.ctx.userContext.userId;
    const { coinId, amount } = param;
    const userAsset = await this.assetService.getUserAssetOneCoin(
      userId,
      coinId
    );

    const coinInfo = await this.coinService.getCoinDetail({ coinId });
    const user = await this.userService.mapping.findOne({ userId });
    // 检查短信验证码
    await this.userService.checkEmailVerifyCode(
      user.email,
      VERIFY_CODE_TYPE.WITHDRAW,
      param.verifyCode
    );

    // 检查交易密码
    await this.userService.checkTradePassword(user, param.tradePassword);

    // 检查谷歌验证码
    await this.userService.checkGoogleVerify(user, param.googleCode);

    // 余额不足
    if (!userAsset || userAsset.balance < amount) {
      throw new MyError('insufficient balance', ErrorLevelEnum.P4);
    }

    const t = await this.mapping.getTransaction();
    try {
      // 扣款
      await this.assetService.modifyUserAsset({
        coinId,
        amount: -amount,
        type: PROFIT_TYPE.WITHDRAW,
        userId,
        currency: ASSET_FIELD.BALANCE,
        remark: 'withdraw amount',
        t,
      });

      await this.assetService.modifyUserAsset({
        coinId,
        amount: amount,
        type: PROFIT_TYPE.WITHDRAW,
        userId,
        currency: ASSET_FIELD.FREEZE_BALANCE,
        remark: 'withdraw amount',
        t,
      });
      await this.mapping.saveNew(
        {
          userId,
          coinId,
          currency: coinInfo.name,
          contract: param.contract,
          toAddress: param.toAddress,
          withdrawAmount: amount,
          serviceChargeAmount: 0.1,
          status: WITHDRAW_STATUS.APPLY,
          remark: param.remark ? param.remark : null,
          preBalance: userAsset.balance,
        },
        { transaction: t }
      );
      await t.commit();
      return true;
    } catch (e) {
      this.logger.error('提币异常:', e);
      await t.rollback();
    }
  }

  /**
   * 同意提现
   * @param withdrawId
   */
  async agreeWithdraw(withdrawId: number) {
    const withdrawInfo = await this.mapping.findOne({ withdrawId });
    if (!withdrawInfo || withdrawInfo.status != WITHDRAW_STATUS.APPLY) {
      throw new MyError('withdraw not exist', ErrorLevelEnum.P4);
    }
    const t = await this.mapping.getTransaction();
    try {
      // 扣冻结款
      await this.assetService.modifyUserAsset({
        coinId: withdrawInfo.coinId,
        amount: -withdrawInfo.withdrawAmount,
        type: PROFIT_TYPE.WITHDRAW,
        userId: withdrawInfo.userId,
        currency: ASSET_FIELD.FREEZE_BALANCE,
        remark: 'withdraw amount agree',
        t,
      });
      await this.mapping.modify(
        { status: WITHDRAW_STATUS.AGREE },
        { withdrawId },
        { transaction: t }
      );
      await t.commit();
      return true;
    } catch (e) {
      this.logger.error('提币同意异常:', e);
      await t.rollback();
    }
  }

  /**
   * 拒绝提现
   * @param param
   * @returns
   */
  async refuseWithdraw(withdrawId: number) {
    const withdrawInfo = await this.mapping.findOne({ withdrawId });
    if (!withdrawInfo || withdrawInfo.status != WITHDRAW_STATUS.APPLY) {
      throw new MyError('withdraw not exist', ErrorLevelEnum.P4);
    }

    const t = await this.mapping.getTransaction();
    try {
      // 扣款
      await this.assetService.modifyUserAsset({
        coinId: withdrawInfo.coinId,
        amount: withdrawInfo.withdrawAmount,
        type: PROFIT_TYPE.WITHDRAW_REFUND,
        userId: withdrawInfo.userId,
        currency: ASSET_FIELD.BALANCE,
        remark: 'withdraw amount refuse',
        t,
      });

      await this.assetService.modifyUserAsset({
        coinId: withdrawInfo.coinId,
        amount: -withdrawInfo.withdrawAmount,
        type: PROFIT_TYPE.WITHDRAW_REFUND,
        userId: withdrawInfo.userId,
        currency: ASSET_FIELD.FREEZE_BALANCE,
        remark: 'withdraw amount refuse',
        t,
      });
      await this.mapping.modify(
        { status: WITHDRAW_STATUS.REFUSE },
        { withdrawId },
        { transaction: t }
      );
      await t.commit();
      return true;
    } catch (e) {
      this.logger.error('提币拒绝异常:', e);
      await t.rollback();
    }
  }
}
