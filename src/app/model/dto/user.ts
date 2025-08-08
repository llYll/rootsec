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

  @ApiProperty({ type: 'string', description: '邀请码' })
  @Rule(RuleType.string().allow('').optional())
  inviteCode?: string
}
