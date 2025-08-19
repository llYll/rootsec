import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'pledge_record',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'pledge_id' }],
    },
  ],
})
export class PledgeRecordEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'pledge_id',
  })
  pledgeId: number;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'user_id',
  })
  userId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'pool_id',
  })
  poolId: number;

  @Column({
    type: DataType.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0.0,
    field: 'sec_amount',
  })
  secAmount: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'start_at',
  })
  startAt: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'end_at',
  })
  endAt: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态1:开始 2：结束',
  })
  status: number;

  totalSecAmount?: number;

  pledgeAmount?: number;
}
