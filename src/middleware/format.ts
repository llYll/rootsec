import { ILogger, IMiddleware, Logger, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

import { ErrorLevelEnum, MyError } from '../app/comm/myError';

@Middleware()
export class FormatMiddleware implements IMiddleware<Context, NextFunction> {
  @Logger()
  logger: ILogger;

  public static getName(): string {
    return 'format';
  }

  /**
   * 确定打印 level
   * @param err
   * @param status
   */
  private getErrorLevel(err: MyError, status: number) {
    if (status == 422) {
      return ErrorLevelEnum.P4;
    }
    return err.level || ErrorLevelEnum.P3; //非 MyError 实例，默认 P3
  }

  public resolve() {
    return async (ctx: Context, next: NextFunction) => {
      try {
        const result = await next();
        if (result === null) {
          ctx.status = 200;
        }

        return {
          code: 0,
          msg: 'OK',
          data: result,
        };
      } catch (err) {
        const myErr = err as MyError;

        // 兼容运行ci的时候，assert抛出的错误为AssertionError没有status
        const [message, messageStatus] = myErr.message?.split(' &>');

        let status = myErr.status || parseInt(messageStatus) || 500;
        if (myErr.name === 'ValidationError' || message === 'ValidationError') {
          status = 422;
        }

        //errorLevel 提出，挂到上下文上
        ctx.errorLevel = this.getErrorLevel(myErr, status);

        if (ctx.errorLevel < 4) {
          // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
          ctx.app.emit('error', err, ctx);
        } else {
          //打印 warning
          this.logger.warn(message);
        }

        // 从 error 对象上读出各个属性，设置到响应中
        ctx.body = {
          code: status,
          msg: message || 'Internal Server Error',
          data: {},
          errorLevel: myErr.level || 3,
        };
        if (status === 422) {
          (ctx.body as any).msg = myErr && myErr.message;
        }
        ctx.status = status;
      }
    };
  }

  public match(ctx: Context): boolean {
    return ctx.path.startsWith('/api');
  }
}
