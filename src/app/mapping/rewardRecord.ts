import { Provide } from '@midwayjs/decorator';
import * as _ from 'lodash';

import { RewardRecordEntity } from '../entity/rewardRecord';
import { BaseMapping } from '../../core/baseMapping';

type TAnyEntity = { [P in keyof RewardRecordEntity]?: any };

@Provide()
export class RewardRecordMapping extends BaseMapping<RewardRecordEntity> {
  getModel() {
    return RewardRecordEntity;
  }

  private _getWhere(param: TAnyEntity = {}) {
    const where: TAnyEntity = {};

    if (_.isEmpty(param)) {
      return where;
    }

    const { id } = param;

    if (id) {
      where.id = id;
    }

    return where;
  }

  async getList(params): Promise<{
    rows: RewardRecordEntity[];
    count: number;
  }> {
    const { page, limit } = params;

    const where = this._getWhere(params);

    const res = await this.getModel().findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
    });

    return res;
  }
}
