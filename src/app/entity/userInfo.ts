import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'user_info',
  timestamps: true,
  paranoid: true,
  indexes: [
   {
    name: "PRIMARY",
    unique: true,
    using: "BTREE",
    fields: [
     { name: "user_id" },
    ]
   },
  ]
})
export class UserInfoEntity extends Model {
  @Column({
   autoIncrement: true,
   type: DataType.INTEGER.UNSIGNED,
   allowNull: false,
   primaryKey: true,
   field: 'user_id'
  })
  userId: number;

  @Column({
   type: DataType.STRING(32),
   allowNull: false,
   comment: "账号"
  })
  username: string;

  @Column({
   type: DataType.STRING(64),
   allowNull: false,
   comment: "邮箱"
  })
  email: string;

  @Column({
   type: DataType.STRING(255),
   allowNull: false,
   comment: "密码",
   field: 'password_hash'
  })
  passwordHash: string;

  @Column({
   type: DataType.STRING(255),
   allowNull: false,
   comment: "密码加密",
   field: 'password_salt'
  })
  passwordSalt: string;

  @Column({
   type: DataType.TINYINT,
   allowNull: false,
   defaultValue: 1
  })
  status: number;

  @Column({
   type: DataType.STRING(255),
   allowNull: true,
   comment: "交易密码",
   field: 'trade_password_hash'
  })
  tradePasswordHash: string;

  @Column({
   type: DataType.STRING(255),
   allowNull: true,
   comment: "交易盐度",
   field: 'trade_password_salt'
  })
  tradePasswordSalt: string;

  @Column({
   type: DataType.STRING(255),
   allowNull: true,
   comment: "谷歌密码",
   field: 'google_secret'
  })
  googleSecret: string;

  @Column({
   type: DataType.INTEGER,
   allowNull: true,
   defaultValue: 1,
   comment: "等级"
  })
  level: number;

  @Column({
    type: DataType.STRING(6),
    allowNull: true,
    comment: "邀请码",
    field: 'invite_code'
   })
   inviteCode: string;

   @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: "上级id"
   })
   pid: number;
}