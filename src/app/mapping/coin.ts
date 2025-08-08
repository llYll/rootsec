import { Provide } from '@midwayjs/decorator';
import * as _ from 'lodash';

import { CoinEntity } from '../entity/coin';
import { BaseMapping } from '../../core/baseMapping';

type TAnyEntity = { [P in keyof CoinEntity]?: any };

@Provide()
export class CoinMapping extends BaseMapping<CoinEntity> {
  getModel() {
    return CoinEntity;
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
    rows: CoinEntity[];
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
