import { UserInfoEntity } from '../../entity/userInfo';

export class UserVO {
  id: number;
  firstName: string;
  lastName: string;
  sex: string;

  constructor(user: UserInfoEntity) {
    this.id = user.id;
  }
}
