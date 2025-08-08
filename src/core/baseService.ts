import { App, Inject } from '@midwayjs/core';
import { Application, Context } from '@midwayjs/koa';
import { Model } from 'sequelize';

/**
 * SERVICE的基类
 */
export abstract class BaseService<T extends Model> {
  @App()
  protected app: Application;

  @Inject()
  protected ctx: Context;
}
