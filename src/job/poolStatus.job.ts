import { Job, IJob } from '@midwayjs/cron';
import { Inject } from '@midwayjs/core';

import { PledgePoolService } from '../app/service/pledgePool';

@Job('ChangePledgePoolJob', {
  cronTime: '0 0 * * * *', //每天整点
  start: true,
})
export class PoolStatusJob implements IJob {
  @Inject()
  pledgePoolService: PledgePoolService;

  async onTick() {
    this.pledgePoolService.changeStatus();
  }
}
