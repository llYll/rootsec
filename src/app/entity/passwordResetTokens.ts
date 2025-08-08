import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'password_reset_tokens',
  timestamps: true,
  paranoid: true,
  indexes: [
   {
    name: "PRIMARY",
    unique: true,
    using: "BTREE",
    fields: [
     { name: "token_id" },
    ]
   },
  ]
})
export class PasswordResetTokensEntity extends Model {
  @Column({
   autoIncrement: true,
   type: DataType.INTEGER.UNSIGNED,
   allowNull: false,
   primaryKey: true,
   field: 'token_id'
  })
  tokenId: number;

  @Column({
   type: DataType.INTEGER,
   allowNull: false,
   field: 'user_id'
  })
  userId: number;

  @Column({
   type: DataType.STRING(64),
   allowNull: false,
   comment: "Cryptographically secure token with’ 64 length"
  })
  token: string;

  @Column({
   type: DataType.DATE,
   allowNull: false,
   comment: "Expire in 60 mins",
   field: 'expires_at'
  })
  expiresAt: string;

  @Column({
   type: DataType.BOOLEAN,
   allowNull: true,
   defaultValue: 0,
   comment: "can only used once",
   field: 'is_used'
  })
  isUsed: boolean;
}