import { Inject, Singleton } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { sleep } from 'happy-node-utils';
import { MyError } from './myError';
import { randomUUID } from '@midwayjs/core/dist/util/uuid';

@Singleton()
export class RedisUtils {
  @Inject()
  private redis: RedisService;

  //存储限流器 trim  时间
  private _limiterTrimTimeMap: Map<string, number> = new Map();

  public async checkLock(key: string) {
    const result = await this.redis.get(key);
    return !!result;
  }

  /**
   * 基于 redis 的限流器
   * 滑动窗口实现多少 s 内请求多少次
   * 尝试获取
   */
  public async tryAcquire(
    rKey: string,
    ttl: number, //ms
    limit: number, //格式
    trimGap: number = 60 * 1000
  ): Promise<boolean> {
    if (!rKey) {
      throw new MyError(`rKey empty`);
    }
    let lastTrimTime = this._limiterTrimTimeMap.get(rKey) || 0;
    let now = Date.now();

    //写入记录, 先 add 避免分布式并发问题。 出问题后，用户需要停至少 5s，才能再次发起请求
    await this.redis.zadd(rKey, now, randomUUID());
    //删除旧元素避免zset 过大
    if (now - lastTrimTime >= trimGap) {
      await this.redis.zremrangebyscore(rKey, 0, now - ttl - 1);
      this._limiterTrimTimeMap.set(rKey, now);
    }

    //zrange 不存在的 key，应该返回 []
    let rangeReqs = await this.redis.zrangebyscore(rKey, now - ttl, now);
    if (rangeReqs && rangeReqs.length >= limit) {
      return false;
    }

    return true;
  }

  /**
   * 分布式锁实现
   * 对于抢占失败的进程，有两种方法：
   * 1. 重试
   * 2. 直接失败
   * @param key
   * @param expireTime
   * @returns
   */
  public async getLock(
    key: string,
    expireTime: number,
    opts?: {
      retry: boolean; //是否重试
      retryMaxLimit?: number; //重试最大次数
      retrySleep?: number; //重试 sleep 时间,ms
    }
  ): Promise<boolean> {
    let { retry, retryMaxLimit, retrySleep } = opts || {};
    retry = retry || false; //默认不重试
    retryMaxLimit = retryMaxLimit || 10; //默认重试 10 次
    retrySleep = retrySleep || 100; //默认休眠 100ms

    let lockRet = await this._redisLock(key, expireTime);
    if (lockRet) {
      return lockRet;
    }
    //失败
    if (!retry) {
      return lockRet;
    }
    //重试
    for (let i = 0; i < retryMaxLimit; i++) {
      await sleep(retrySleep);
      let retryRet = await this._redisLock(key, expireTime);
      if (retryRet) {
        //重试成功
        return retryRet;
      }
    }
    throw new MyError('getLock重试失败');
  }

  /**
   * 私有加锁流程
   * @param key
   * @param expireTime
   * @returns
   */
  private async _redisLock(key: string, expireTime: number) {
    const lock = await this.redis.get(key);
    if (lock) {
      return false;
    }
    let ret = await this.redis.setnx(key, 1);
    //设置成功
    if (ret == 1) {
      //设置过期时间
      await this.redis.expire(key, expireTime);
      return true;
    } else {
      return false;
    }
  }

  public async unLock(key) {
    const lock = await this.redis.get(key);
    if (!lock) {
      return true;
    }
    const res = await this.redis.del(key);
    return res;
  }

  public async setValue(key: string, value: string, expireTime?: number) {
    if (!expireTime) {
      await this.redis.set(key, value);
    } else {
      await this.redis.set(key, value, 'EX', expireTime);
    }
  }

  public async getString(key: string) {
    if (!key) {
      return null;
    }

    return await this.redis.get(key);
  }

  public async incr(key: string) {
    if (!key) {
      return null;
    }

    return await this.redis.incr(key);
  }
}

export default RedisUtils;
