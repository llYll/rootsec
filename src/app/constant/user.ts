export enum UserStatus {
  NORMAL = 1, //正常
  FORBIDDEN = 0, //禁用
}

export enum PASSWORD_TOKEN_USE_STATUS {
  UNUSED = 0, //禁用
  USED = 1, //正常
}

export enum ASSET_FIELD {
  BALANCE = 'balance',
  PLEDGE = 'pledge',
  FREEZE_BALANCE = 'freezeBalance',
}

export enum VERIFY_CODE_TYPE {
  REGISTER = 1, //注册
  WITHDRAW = 2, //提现
}

export enum WITHDRAW_STATUS {
  APPLY = 1,
  AGREE = 2,
  SUCCESS = 3,
  REFUSE = -1,
  FAIL = -2,
}
