import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'user_asset',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'user_asset_id' }],
    },
  ],
})
export class UserAssetEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'user_asset_id',
  })
  userAssetId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'coin_id',
  })
  coinId: number;

  @Column({
    type: DataType.DECIMAL(12, 4),
    allowNull: false,
    comment: '余额',
  })
  balance: number;

  @Column({
    type: DataType.DECIMAL(12, 4),
    allowNull: false,
    comment: '质押',
  })
  pledge: number;

  @Column({
    type: DataType.DECIMAL(12, 4),
    allowNull: false,
    comment: '提现冻结金额',
    field: 'freeze_balance',
  })
  freezeBalance: number;
}
