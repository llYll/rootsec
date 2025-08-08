import { Rule, RuleType } from '@midwayjs/validate';
import { ApiProperty } from '@midwayjs/swagger';
import { QueryParamDTO } from './base';

export class GetListDTO extends QueryParamDTO {}

export class AddCoinDTO {
  @ApiProperty({ type: 'string', description: '代号' })
  @Rule(RuleType.string().required())
  name: string;

  @ApiProperty({ type: 'string', description: '图标' })
  @Rule(RuleType.string().required())
  icon: string;

  @ApiProperty({ type: 'string', description: '图标' })
  @Rule(RuleType.string().required())
  url: string;
}