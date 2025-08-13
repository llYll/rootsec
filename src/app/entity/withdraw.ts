import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'withdraw',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'withdraw_id' }],
    },
    {
      name: 'idx_user_id',
      using: 'BTREE',
      fields: [{ name: 'user_id' }],
    },
  ],
})
export class WithdrawEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: '提现表主键id',
    field: 'withdraw_id',
  })
  withdrawId: number;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    comment: 'user表主键id',
    field: 'user_id',
  })
  userId: number;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    comment: 'coin表主键id',
    field: 'coin_id',
  })
  coinId: number;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    comment: '币种 fil usdt',
  })
  currency: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '合约类型',
  })
  contract: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '提现地址',
    field: 'to_address',
  })
  toAddress: string;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: false,
    defaultValue: 0.0,
    comment: '提取金额',
    field: 'withdraw_amount',
  })
  withdrawAmount: number;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: false,
    defaultValue: 0.01,
    comment: '手续费金额',
    field: 'service_charge_amount',
  })
  serviceChargeAmount: number;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment:
      '申请状态 -2提现失败 -1:审核失败 1:待审核 2:审核通过待打款 3:已汇出',
  })
  status: number;

  @Column({
    type: DataType.STRING(6),
    allowNull: true,
    defaultValue: '-1',
    comment:
      '提现申请返回状态码 -1:没有返回码 0:成功 120402:钱包资金不足 110055:提现地址错误 ...',
  })
  code: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    defaultValue: '',
    comment: '交易hash',
  })
  hash: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    defaultValue: '',
    comment: '备注',
  })
  remark: string;

  @Column({
    type: DataType.DECIMAL(18, 8),
    allowNull: false,
    defaultValue: 0.0,
    comment: '提现前金额',
    field: 'pre_balance',
  })
  preBalance: number;
}
