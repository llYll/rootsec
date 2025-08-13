import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'pledge_pool',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'pool_id' }],
    },
  ],
})
export class PledgePoolEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'pool_id',
  })
  poolId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '代币id',
    field: 'coin_id',
  })
  coinId: number;

  @Column({
    type: DataType.DECIMAL(15, 4),
    allowNull: false,
    defaultValue: 0.0,
    comment: '总金额',
    field: 'total_amount',
  })
  totalAmount: number;

  @Column({
    type: DataType.DECIMAL(15, 4),
    allowNull: false,
    defaultValue: 0.0,
    comment: '剩余金额',
    field: 'left_amount',
  })
  leftAmount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '周期',
  })
  cycle: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '锁',
  })
  version: number;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态',
  })
  status: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: '开始时间',
    field: 'start_at',
  })
  startAt: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: '结束时间',
    field: 'end_at',
  })
  endAt: string;
}
