import * as dotenv from 'dotenv';
dotenv.config();

import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as crossDomain from '@midwayjs/cross-domain';
import {
  ILifeCycle,
  IMidwayContainer,
  App,
  Configuration,
  Logger,
} from '@midwayjs/core';
import { IMidwayLogger } from '@midwayjs/logger';
import * as swagger from '@midwayjs/swagger';
import * as redis from '@midwayjs/redis';
import * as sequlize from '@midwayjs/sequelize';
import { join } from 'path';
import * as jwt from '@midwayjs/jwt';

import { RequestIdMiddleware } from './middleware/requestId';
import { FormatMiddleware } from './middleware/format';
import { AccessLogMiddleware } from './middleware/accessLog';
import { JwtMiddleware } from './middleware/jwt';
import { NotFoundFilter } from './filter/notfound';

@Configuration({
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
  imports: [
    crossDomain,
    koa,
    { component: swagger, enabledEnvironment: ['local'] },
    redis,
    validate,
    sequlize,
    jwt,
  ],
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: koa.Application;
  @Logger()
  readonly logger: IMidwayLogger;

  async onReady(applicationContext: IMidwayContainer): Promise<void> {
    this.app.useMiddleware([
      RequestIdMiddleware,
      AccessLogMiddleware,
      FormatMiddleware,
      JwtMiddleware,
    ]);
    this.app.useFilter([NotFoundFilter]);
  }

  async onStop(): Promise<void> {}
}
