import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'coin',
  timestamps: true,
  paranoid: true,
  indexes: [
   {
    name: "PRIMARY",
    unique: true,
    using: "BTREE",
    fields: [
     { name: "coin_id" },
    ]
   },
  ]
})
export class CoinEntity extends Model {
  @Column({
   autoIncrement: true,
   type: DataType.INTEGER,
   allowNull: false,
   primaryKey: true,
   field: 'coin_id'
  })
  coinId: number;

  @Column({
   type: DataType.STRING(32),
   allowNull: false
  })
  name: string;

  @Column({
   type: DataType.STRING(255),
   allowNull: false
  })
  icon: string;

  @Column({
   type: DataType.STRING(255),
   allowNull: false
  })
  url: string;
}