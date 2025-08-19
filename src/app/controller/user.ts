import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
} from '@midwayjs/core';
import { BaseController } from '../../core/baseController';
import { UserService } from '../service/user';
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
import { Utils } from '../comm/utils';

@Controller('/user')
export class UserController extends BaseController {
  @Inject()
  service: UserService;

  @Inject()
  utils: Utils;

  @Post('/register')
  async register(
    @Body(ALL)
    param: RegisterDTO
  ) {
    const res = await this.service.register(param);
    return this.success(res);
  }

  @Post('/login')
  async login(
    @Body(ALL)
    param: LoginDTO
  ) {
    const ret = await this.service.login(param);
    return this.success(ret);
  }

  @Get('/forget/password')
  async forgetPassword(
    @Query('email')
    email: string
  ) {
    const ret = await this.service.forgetPassword(email);
    return this.success(ret);
  }

  /**
   * 重置密码
   * @param params
   * @returns
   */
  @Post('/reset/password')
  async resetPassword(
    @Body(ALL)
    params: ResetPasswordDTO
  ) {
    const ret = await this.service.resetPassword(params);
    return this.success(ret);
  }

  /**
   * 发送验证码
   * @param param
   * @returns
   */
  @Post('/send/email/verify')
  async sendEmailVerify(
    @Body(ALL)
    param: SendEmailDTO
  ) {
    const ret = await this.service.sendUserVerifyCode(param);
    return this.success(ret);
  }

  /**
   * 设置交易密码
   * @param param
   * @returns
   */
  @Post('/set/tradepwd')
  async setTradePwd(
    @Body(ALL)
    param: SetTradePwdDTO
  ) {
    const ret = await this.service.setTradePwd(param);
    return this.success(ret);
  }

  /**
   * 获取谷歌秘钥
   * @returns
   */
  @Get('/get/google/secret')
  async getGoogleSecret() {
    const ret = await this.utils.getGoogleSecret();
    return this.success({
      secret: ret.secret,
    });
  }

  /**
   * 设置谷歌秘钥
   * @param param
   * @returns
   */
  @Post('/set/google/secret')
  async setGoogleSecret(
    @Body(ALL)
    param: SetGoogleSecretDTO
  ) {
    const ret = await this.service.setGoogleSecret(param);
    return this.success(ret);
  }

  @Post('/modify/email')
  async changeEmail(
    @Body(ALL)
    param: ModifyEmailDTO
  ) {
    const ret = await this.service.modifyEmail(param);
    return this.success(ret);
  }
  @Post('/modify/password')
  async modifyPassword(
    @Body(ALL)
    param: ModifyPasswordDTO
  ) {
    const ret = await this.service.modifyPassword(param);
    return this.success(ret);
  }
}
