import { Rule, RuleType } from '@midwayjs/validate';
import { ApiProperty } from '@midwayjs/swagger';
import { QueryParamDTO } from './base';

export class GetListDTO extends QueryParamDTO {}

export class LoginDTO {
  @ApiProperty({ type: 'string', description: '用户名' })
  @Rule(RuleType.string().required())
  username: string;

  @ApiProperty({ type: 'string', description: '密码' })
  @Rule(RuleType.string().required())
  password: string;
}

export class ResetPasswordDTO {
  @ApiProperty({ type: 'string', description: 'token' })
  @Rule(RuleType.string().required())
  token: string;

  @ApiProperty({ type: 'string', description: '密码' })
  @Rule(RuleType.string().required())
  password: string;
}

export class RegisterDTO {
  @ApiProperty({ type: 'string', description: '用户名' })
  @Rule(RuleType.string().required())
  username: string;

  @ApiProperty({ type: 'string', description: '邮件 ' })
  @Rule(RuleType.string().required())
  email: string;

  @ApiProperty({ type: 'string', description: '密码' })
  @Rule(RuleType.string().required())
  password: string;
}

export class UserProfitDTO extends QueryParamDTO {
  @ApiProperty({ type: 'number', description: '用户id' })
  @Rule(RuleType.number().allow('').optional())
  userId?: number;

  @ApiProperty({ type: 'string', description: '币种名称' })
  @Rule(RuleType.string().allow('').optional())
  coinName?: string;

  @ApiProperty({ type: 'number', description: '类型' })
  @Rule(RuleType.number().allow('').optional())
  type?: number;
}

export class ApplyWithdrawDTO {
  @ApiProperty({ type: 'number', description: '币种Id' })
  @Rule(RuleType.number().required())
  coinId: number;

  @ApiProperty({ type: 'number', description: '金额' })
  @Rule(RuleType.number().required())
  amount: number;

  @ApiProperty({ type: 'string', description: '交易密码' })
  @Rule(RuleType.string().required())
  tradePassword: string;

  @ApiProperty({ type: 'string', description: '谷歌验证码' })
  @Rule(RuleType.string().required())
  googleCode: string;

  @ApiProperty({ type: 'string', description: '验证码' })
  @Rule(RuleType.string().required())
  verifyCode: string;

  @ApiProperty({ type: 'string', description: '提现合约' })
  @Rule(RuleType.string().required())
  contract: string;

  @ApiProperty({ type: 'string', description: '提现地址' })
  @Rule(RuleType.string().required())
  toAddress: string;

  @ApiProperty({ type: 'string', description: '提现地址' })
  @Rule(RuleType.string().optional().allow(''))
  remark?: string;
}

export class UserAssetInfoDTO {
  @ApiProperty({ type: 'string', description: '用户id' })
  @Rule(RuleType.string().allow('').optional())
  uid?: string;

  @ApiProperty({ type: 'string', description: '邮件 ' })
  @Rule(RuleType.string().allow('').optional())
  coinName: string;
}

export class SendEmailDTO {
  @ApiProperty({ type: 'number', description: '交易密码' })
  @Rule(RuleType.number().required())
  type: number;

  @ApiProperty({ type: 'string', description: '交易密码' })
  @Rule(RuleType.string().allow('').optional())
  email?: string;
}

export class SetTradePwdDTO {
  @ApiProperty({ type: 'string', description: '交易密码' })
  @Rule(RuleType.string().required())
  tradePwd: string;

  @ApiProperty({ type: 'string', description: '验证码' })
  @Rule(RuleType.string().required())
  verifyCode: string;
}

export class SetGoogleSecretDTO {
  @ApiProperty({ type: 'string', description: '谷歌秘钥' })
  @Rule(RuleType.string().required())
  secret: string;

  @ApiProperty({ type: 'string', description: '验证码' })
  @Rule(RuleType.string().required())
  code: string;
}

export class ModifyEmailDTO {
  @ApiProperty({ type: 'string', description: '谷歌秘钥' })
  @Rule(RuleType.string().required())
  email: string;

  @ApiProperty({ type: 'string', description: '验证码' })
  @Rule(RuleType.string().required())
  oldVerifyCode: string;

  @ApiProperty({ type: 'string', description: '验证码' })
  @Rule(RuleType.string().required())
  newVerifyCode: string;
}

export class ModifyPasswordDTO {
  @ApiProperty({ type: 'string', description: '谷歌秘钥' })
  @Rule(RuleType.string().required())
  oldPassword: string;

  @ApiProperty({ type: 'string', description: '验证码' })
  @Rule(RuleType.string().required())
  newPassword: string;
}
