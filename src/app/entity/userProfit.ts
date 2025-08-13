import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'user_profit',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'user_profit_id' }],
    },
  ],
})
export class UserProfitEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    field: 'user_profit_id',
  })
  userProfitId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '用户id',
    field: 'user_id',
  })
  userId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '币种id',
    field: 'coin_id',
  })
  coinId: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    comment: '字段',
  })
  currency: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    comment: '币种名称',
    field: 'coin_name',
  })
  coinName: string;

  @Column({
    type: DataType.DECIMAL(12, 4),
    allowNull: false,
    defaultValue: 0.0,
    comment: '金额',
  })
  amount: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    defaultValue: '',
    comment: '说明',
  })
  remark: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '类型',
  })
  type: number;
}
