import { ALL, Body, Controller, Inject, Post } from '@midwayjs/core';
import { BaseController } from '../../core/baseController';
import { AdminService } from '../service/admin';
import { AddAdminDTO, LoginAdminDTO } from '../model/dto/admin';
import { AddPledgePoolDTO } from '../model/dto/pool';
import { PledgePoolService } from '../service/pledgePool';
import { CoinService } from '../service/coin';
import { AddCoinDTO } from '../model/dto/coin';

@Controller('/admin')
export class AdminController extends BaseController {
  @Inject()
  adminService: AdminService;

  @Inject()
  pledgePoolService: PledgePoolService;

  @Inject()
  coinService: CoinService;

  @Post('/login')
  async login(
    @Body(ALL)
    param: LoginAdminDTO
  ) {
    const res = await this.adminService.login(param);
    return this.success(res);
  }

  @Post('/add')
  async addAdmin(
    @Body(ALL)
    param: AddAdminDTO
  ) {
    const ret = await this.adminService.addAdmin(param);
    return this.success(ret);
  }

  @Post('/add/pledge/pool')
  async addPool(
    @Body(ALL)
    param: AddPledgePoolDTO
  ) {
    const ret = await this.pledgePoolService.addPool(param);
    return this.success(ret);
  }

  @Post('/add/coin')
  async addCoin(
    @Body(ALL)
    param: AddCoinDTO
  ) {
    const ret = await this.coinService.addCoin(param);
    return this.success(ret);
  }
}
