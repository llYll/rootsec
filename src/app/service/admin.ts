import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';

import { BaseService } from '../../core/baseService';
import { MyError, ErrorLevelEnum } from '../comm/myError';
import { UserStatus } from '../constant/user';
import { PasswordResetTokensService } from './passwordResetTokens';
import { Utils } from '../comm/utils';
import RedisUtils from '../comm/redis';
import { AdminEntity } from '../entity/admin';
import { AdminMapping } from '../mapping/admin';
import { AddAdminDTO, LoginAdminDTO } from '../model/dto/admin';

@Provide()
export class AdminService extends BaseService<AdminEntity> {
  @Inject()
  mapping: AdminMapping;

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
   * 新增管理员
   * @param params
   * @returns
   */
  async addAdmin(params: AddAdminDTO): Promise<boolean> {
    const { account, password } = params;
    const user = await this.mapping.findOne({ account });
    if (user) {
      throw new MyError('admin has been registered', ErrorLevelEnum.P4);
    }
    const salt = this.utils.generateSalt(16);
    const passwordHash = this.utils.hashPassword(password, salt);
    await this.mapping.saveNew({
      account,
      passwordHash,
      passwordSalt: salt,
      status: UserStatus.NORMAL,
    });
    return true;
  }
  /**
   * 用户登录
   * @param params
   * @returns
   */
  async login(params: LoginAdminDTO): Promise<{ token: string }> {
    const { account, password } = params;
    const admin = await this.mapping.findOne({ account });

    if (!admin) {
      throw new MyError('password is wrong', ErrorLevelEnum.P4);
    }

    if (admin.status != UserStatus.NORMAL) {
      throw new MyError('user not active', ErrorLevelEnum.P4);
    }

    const hashedPassword = this.utils.hashPassword(
      password,
      admin.passwordSalt
    );
    if (hashedPassword !== admin.passwordHash) {
      throw new MyError('password is wrong', ErrorLevelEnum.P4);
    }

    const token = await this.utils.getJwtToken(
      admin.adminId.toString(),
      admin.account
    );
    return { token };
  }
}
