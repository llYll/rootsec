import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'admin',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'admin_id' }],
    },
  ],
})
export class AdminEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'admin_id',
  })
  adminId: number;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  account: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'password_hash',
  })
  passwordHash: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'password_salt',
  })
  passwordSalt: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    comment: '1',
  })
  status: number;
}
