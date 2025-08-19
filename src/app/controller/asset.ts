import { ALL, Controller, Get, Inject, Query } from '@midwayjs/core';
import { BaseController } from '../../core/baseController';
import { UserAssetService } from '../service/userAsset';
import { UserAssetInfoDTO, UserProfitDTO } from '../model/dto/user';

@Controller('/user/asset')
export class UserAssetController extends BaseController {
  @Inject()
  service: UserAssetService;

  @Get('/')
  async getInfo(
    @Query(ALL)
    param: UserAssetInfoDTO
  ) {
    const res = await this.service.getUserAsset(param);
    return this.success(res);
  }

  @Get('/profits')
  async profits(
    @Query(ALL)
    param: UserProfitDTO
  ) {
    const res = await this.service.getUserProfit(param);
    return this.success(res);
  }
}
