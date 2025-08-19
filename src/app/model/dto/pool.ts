import { Rule, RuleType } from '@midwayjs/validate';
import { ApiProperty } from '@midwayjs/swagger';
import { QueryParamDTO } from './base';

export class GetPoolListDTO extends QueryParamDTO {
  @ApiProperty({ type: 'number', description: '币种Id' })
  @Rule(RuleType.number().allow('').optional())
  status?: number;
}

export class AddPledgePoolDTO {
  @ApiProperty({ type: 'number', description: '数量' })
  @Rule(RuleType.number().required())
  coinId: number;

  @ApiProperty({ type: 'number', description: '金额' })
  @Rule(RuleType.number().required())
  totalAmount: number;

  @ApiProperty({ type: 'number', description: '周期' })
  @Rule(RuleType.number().required())
  cycle: number;

  @ApiProperty({ type: 'string', description: '开始时间' })
  @Rule(RuleType.string().required())
  startAt: string;

  @ApiProperty({ type: 'string', description: '结束时间' })
  @Rule(RuleType.string().required())
  endAt: string;
}

export class ModifyPledgePoolDTO {
  @ApiProperty({ type: 'number', description: '矿池Id' })
  @Rule(RuleType.number().required())
  poolId: number;

  @ApiProperty({ type: 'number', description: '币种Id' })
  @Rule(RuleType.number().allow('').optional())
  coinId: number;

  @ApiProperty({ type: 'number', description: '币种Id' })
  @Rule(RuleType.number().allow('').optional())
  totalAmount: number;

  @ApiProperty({ type: 'number', description: '周期' })
  @Rule(RuleType.number().allow('').optional())
  cycle: string;

  @ApiProperty({ type: 'string', description: '开始时间' })
  @Rule(RuleType.number().allow('').optional())
  startAt: string;

  @ApiProperty({ type: 'string', description: '结束时间' })
  @Rule(RuleType.number().allow('').optional())
  endAt: string;
}

export class PledgePoolDTO {
  @ApiProperty({ type: 'number', description: '矿池Id' })
  @Rule(RuleType.number().required())
  poolId: number;

  @ApiProperty({ type: 'number', description: '质押金额' })
  @Rule(RuleType.number().required())
  pledgeAmount: number;
}
