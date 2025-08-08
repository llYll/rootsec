import { Config, ILogger, Init, Inject, Logger, Provide } from '@midwayjs/core';
import { NotificationService, EmailConfig } from 'notification-service-sdk';
import * as crypto from 'crypto';

import { PasswordResetTokensMapping } from '../mapping/passwordResetTokens';
import { BaseService } from '../../core/baseService';
import { PasswordResetTokensEntity } from '../entity/passwordResetTokens';

import { MyError, ErrorLevelEnum } from '../comm/myError';
import { PASSWORD_TOKEN_USE_STATUS } from '../constant/user';

@Provide()
export class PasswordResetTokensService extends BaseService<PasswordResetTokensEntity> {
  @Inject()
  protected mapping: PasswordResetTokensMapping;

  @Logger()
  logger: ILogger;

  @Config('email')
  private email;

  @Config('webUrl')
  private webUrl: string;

  private emailConfig: EmailConfig;

  @Init()
  protected async init() {
    this.emailConfig = {
      host: this.email.host,
      port: this.email.port,
      secure: true,
      auth: {
        user: this.email.user,
        pass: this.email.pass,
      },
    };
  }

  /**
   * 获取忘记token
   * @param userId
   * @param email
   * @returns
   */
  async getForgetToken(userId: number, email: string): Promise<boolean> {
    let existToken = true;
    let token = '';
    while (existToken) {
      token = this.generateToken();
      const exist = await this.mapping.findOne({
        token,
      });
      if (!exist) {
        existToken = false;
      }
    }
    await this.mapping.saveNew({
      userId,
      token,
      expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000),
    });
    return await this.sendEmail(email, token);
  }

  /**
   * 使用token
   * @param token
   * @returns
   */
  async checkToken(token: string): Promise<number> {
    const record = await this.mapping.findOne({ token });
    if (!record) {
      throw new MyError(
        'please click forget password first',
        ErrorLevelEnum.P4
      );
    }
    if (new Date(record.expiresAt) < new Date()) {
      throw new MyError('token is expired', ErrorLevelEnum.P4);
    }
    if (record.isUsed) {
      throw new MyError('token is used', ErrorLevelEnum.P4);
    }
    return record.userId;
  }

  async useToken(token: string) {
    await this.mapping.modify(
      { isUsed: PASSWORD_TOKEN_USE_STATUS.USED },
      { token }
    );
  }
  /**
   * 生成token
   * @returns
   */
  private generateToken(): string {
    let token = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // Generate 64 random characters
    for (let j = 0; j < 64; j++) {
      const randomIndex = crypto.randomInt(0, characters.length);
      token += characters[randomIndex];
    }
    return token;
  }

  /**
   * 发送邮箱
   * @param email
   * @returns
   */
  async sendEmail(email: string, token: string): Promise<boolean> {
    const emailProvider = NotificationService.createEmailProvider(
      this.emailConfig
    );

    const result = await emailProvider.send({
      to: email,
      subject: 'reset password',
      text: 'click to reset password',
      html: `<p>click url to reset password <a href="${this.webUrl}/reset?token=${token}">here</a></p>`,
    });
    if (result.success) {
      this.logger.info('邮件发送成功:', result.messageId);
      return true;
    } else {
      this.logger.error('邮件发送失败:', result.messageId);
      return false;
    }
  }
}
