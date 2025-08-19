import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'reward_record',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'reward_id' }],
    },
  ],
})
export class RewardRecordEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'reward_id',
  })
  rewardId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'pool_id',
  })
  poolId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'coin_id',
  })
  coinId: number;

  @Column({
    type: DataType.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0.0,
    field: 'reward_amount',
  })
  rewardAmount: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'release_date',
  })
  releaseDate: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    comment: '0:未释放 1:已完成',
  })
  status: number;
}
