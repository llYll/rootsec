import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';

import { UserInfoMapping } from '../mapping/userInfo';
import { BaseService } from '../../core/baseService';
import { UserInfoEntity } from '../entity/userInfo';
import { MyError, ErrorLevelEnum } from '../comm/myError';
import { UserStatus, VERIFY_CODE_TYPE } from '../constant/user';
import {
  LoginDTO,
  ModifyEmailDTO,
  ModifyPasswordDTO,
  RegisterDTO,
  ResetPasswordDTO,
  SendEmailDTO,
  SetGoogleSecretDTO,
  SetTradePwdDTO,
} from '../model/dto/user';
import { PasswordResetTokensService } from './passwordResetTokens';
import { Utils } from '../comm/utils';
import RedisUtils from '../comm/redis';

@Provide()
export class UserService extends BaseService<UserInfoEntity> {
  @Inject()
  mapping: UserInfoMapping;

  @Logger()
  logger: ILogger;

  @Inject()
  passwordResetTokensService: PasswordResetTokensService;

  @Inject()
  redisUtils: RedisUtils;

  @Inject()
  utils: Utils;

  @Inject()
  jwtService: JwtService;

  /**
   * 注册
   * @param params
   * @returns
   */
  async register(params: RegisterDTO): Promise<boolean> {
    const { username, email, password } = params;
    const user = await this.mapping.findOne({ username });
    if (user) {
      throw new MyError('user has been registered', ErrorLevelEnum.P4);
    }
    const salt = this.utils.generateSalt(16);
    const passwordHash = this.utils.hashPassword(password, salt);
    await this.mapping.saveNew({
      email,
      username,
      passwordSalt: salt,
      status: UserStatus.NORMAL,
      passwordHash,
    });
    return true;
  }
  /**
   * 用户登录
   * @param params
   * @returns
   */
  async login(params: LoginDTO): Promise<{ token: string }> {
    const { username, password } = params;
    const user = await this.mapping.findOne({ username });

    if (!user) {
      throw new MyError('password is wrong', ErrorLevelEnum.P4);
    }

    if (user.status != UserStatus.NORMAL) {
      throw new MyError('user not active', ErrorLevelEnum.P4);
    }

    const hashedPassword = this.utils.hashPassword(password, user.passwordSalt);
    if (hashedPassword !== user.passwordHash) {
      throw new MyError('password is wrong', ErrorLevelEnum.P4);
    }

    const token = await this.utils.getJwtToken(
      user.userId.toString(),
      user.email
    );
    return { token };
  }

  /**
   * 重置密码
   * @param params
   * @returns
   */
  async resetPassword(params: ResetPasswordDTO): Promise<boolean> {
    const { password, token } = params;
    const userId = await this.passwordResetTokensService.checkToken(token);
    const user = await this.mapping.findOne({ userId });
    const oldPwd = this.utils.hashPassword(password, user.passwordSalt);
    if (oldPwd === user.passwordHash) {
      throw new MyError(
        'Please use a new password that is different from the original password',
        ErrorLevelEnum.P4
      );
    }
    const salt = this.utils.generateSalt(16);
    const passwordHash = this.utils.hashPassword(password, salt);
    await this.mapping.modify({ salt, passwordHash }, { userId });
    await this.passwordResetTokensService.useToken(token);
    return true;
  }

  /**
   *  忘记密码
   * @param email
   */
  async forgetPassword(email: string): Promise<boolean> {
    const user = await this.mapping.findOne({ email });
    if (!user) {
      throw new MyError('User not exist', ErrorLevelEnum.P4);
    }
    const ret = await this.passwordResetTokensService.getForgetToken(
      user.userId,
      user.email
    );
    return ret;
  }

  /**
   *  检查交易密码
   * @param userId
   * @param password
   * @returns
   */
  async checkTradePassword(
    user: UserInfoEntity,
    password: string
  ): Promise<boolean> {
    if (!user.tradePasswordHash) {
      throw new MyError('trade password not set', ErrorLevelEnum.P4);
    }
    const { tradePasswordSalt, tradePasswordHash } = user;
    const checkPassword = this.utils.hashPassword(password, tradePasswordSalt);
    if (checkPassword === tradePasswordHash) {
      return true;
    }
    throw new MyError('trade password incorrect', ErrorLevelEnum.P4);
  }

  // 检查谷歌验证码
  async checkGoogleVerify(
    user: UserInfoEntity,
    code: string
  ): Promise<boolean> {
    if (!user.googleSecret) {
      throw new MyError('Google verify not set', ErrorLevelEnum.P4);
    }
    this.utils.checkGoogleVerify(user.googleSecret, code);
    return true;
  }

  /**
   * 发送验证码
   * @param param
   * @returns
   */
  async sendUserVerifyCode(param: SendEmailDTO): Promise<boolean> {
    const { email, type } = param;
    let contract = email;
    if (!contract) {
      const userId = this.ctx.userContext.userId;
      const user = await this.mapping.findOne({ userId });
      contract = user.email;
    }
    await this.sendEmailVerifyCode(contract, type, 5 * 60);
    return true;
  }

  /**
   * 发送邮箱验证码
   * @param email
   * @param type
   * @returns
   */
  async sendEmailVerifyCode(
    email: string,
    type: number,
    time: number
  ): Promise<boolean> {
    const code = this.utils.generateSalt(6);
    await this.redisUtils.setValue(`${type}:${email}`, code, time);
    await this.passwordResetTokensService.sendEmailVerify(email, code);
    return true;
  }

  /**
   * 检查验证码
   * @param email
   * @param type
   * @param code
   * @returns
   */
  async checkEmailVerifyCode(
    email: string,
    type: number,
    code: string
  ): Promise<boolean> {
    const ret = await this.redisUtils.getString(`${type}:${email}`);
    if (!ret) {
      throw new MyError('code expired', ErrorLevelEnum.P4);
    }
    if (code != ret) {
      throw new MyError('code incorrect', ErrorLevelEnum.P4);
    }
    return true;
  }

  /**
   * 设置安全密码
   * @param param
   */
  async setTradePwd(param: SetTradePwdDTO) {
    const { tradePwd, verifyCode } = param;
    const userId = this.ctx.userContext.userId;
    const user = await this.mapping.findOne({ userId });
    await this.checkEmailVerifyCode(
      user.email,
      VERIFY_CODE_TYPE.SET_TRADE_PASSWORD,
      verifyCode
    );
    const tradeSalt = this.utils.generateSalt(16);
    const tradePasswordHash = this.utils.hashPassword(tradePwd, tradeSalt);
    await this.mapping.modify(
      {
        tradePasswordHash,
        tradePasswordSalt: tradeSalt,
      },
      { userId }
    );
    return true;
  }

  /**
   * 设置谷歌秘钥
   * @param param
   * @returns
   */
  async setGoogleSecret(param: SetGoogleSecretDTO) {
    const { secret, code } = param;
    this.utils.checkGoogleVerify(secret, code);
    const userId = this.ctx.userContext.userId;
    await this.mapping.modify({ googleSecret: secret }, { userId });
    return true;
  }

  /**
   * 修改邮箱
   * @param param
   * @returns
   */
  async modifyEmail(param: ModifyEmailDTO) {
    const userId = this.ctx.userContext.userId;
    const { email, oldVerifyCode, newVerifyCode } = param;
    const user = await this.mapping.findOne({ userId });
    await this.checkEmailVerifyCode(
      user.email,
      VERIFY_CODE_TYPE.MODIFY_EMAIL,
      oldVerifyCode
    );
    await this.checkEmailVerifyCode(
      email,
      VERIFY_CODE_TYPE.MODIFY_EMAIL,
      newVerifyCode
    );
    await this.mapping.modify({ email }, { userId });
    return true;
  }

  /**
   * 修改密码
   * @param param
   * @returns
   */
  async modifyPassword(param: ModifyPasswordDTO) {
    const { oldPassword, newPassword } = param;
    const userId = this.ctx.userContext.userId;
    const user = await this.mapping.findOne({ userId });
    const oldPwd = this.utils.hashPassword(oldPassword, user.passwordSalt);
    if (oldPwd !== user.passwordHash) {
      throw new MyError('old password incorrect', ErrorLevelEnum.P4);
    }
    const salt = this.utils.generateSalt(16);
    const passwordHash = this.utils.hashPassword(newPassword, salt);
    await this.mapping.modify({ passwordSalt: salt, passwordHash }, { userId });
    return true;
  }
}
