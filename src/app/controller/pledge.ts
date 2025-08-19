import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
} from '@midwayjs/core';
import { BaseController } from '../../core/baseController';
import { PledgePoolService } from '../service/pledgePool';
import { GetPoolListDTO, PledgePoolDTO } from '../model/dto/pool';

@Controller('/user/pledge')
export class PledgeController extends BaseController {
  @Inject()
  service: PledgePoolService;

  @Get('/pool/list')
  async getInfo(
    @Query(ALL)
    param: GetPoolListDTO
  ) {
    const res = await this.service.userPoolList(param);
    return this.success(res);
  }

  @Post('/subscribe')
  async subscribe(
    @Body(ALL)
    param: PledgePoolDTO
  ) {
    const res = await this.service.buyPledgePool(param);
    return this.success(res);
  }
}
