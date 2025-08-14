import { Provide, Inject, Scope, ScopeEnum } from '@midwayjs/decorator';
import * as randomstring from 'randomstring';
import * as crypto from 'crypto';
import { JwtService } from '@midwayjs/jwt';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import * as speakeasy from 'speakeasy';

import { ErrorLevelEnum, MyError } from './myError';

const DATE_FORMATE = 'YYYY-MM-DD HH:mm:ss';

type BigParam = BigNumber | string | number;

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class Utils {
  @Inject('dayjs')
  dayjsTool;

  @Inject()
  jwtService: JwtService;

  isEmpty(value?) {
    return _.isEmpty(value);
  }

  isNotEmpty(value?) {
    return !_.isEmpty(value);
  }

  haveValue(value) {
    return !(value === undefined);
  }

  getDateNow(date = DATE_FORMATE): string {
    const dateStr: string = this.dayjsTool().format(date);
    return dateStr;
  }

  getDateEndTime(time?): string {
    return this.dayjsTool(time).endOf('day').format(DATE_FORMATE);
  }

  getDateStartTime(time?): string {
    return this.dayjsTool(time).startOf('day').format(DATE_FORMATE);
  }

  getDateSeconds(time?): number {
    return this.dayjsTool(time).unix();
  }

  isBeforeOneDay(date, chooseDate = null) {
    const lastDate = chooseDate ? chooseDate : this.getDateNow('YYYY-MM-DD');
    return this.dayjsTool(lastDate).isBefore(this.dayjsTool(date));
  }

  isAfterOneDay(date, chooseDate = null) {
    const lastDate = chooseDate ? chooseDate : this.getDateNow('YYYY-MM-DD');
    return this.dayjsTool(lastDate).isAfter(this.dayjsTool(date));
  }

  getDateDiff(date1, date2, format = 'day'): number {
    return this.dayjsTool(date1).diff(this.dayjsTool(date2), format);
  }

  getDateNowAdd8hours(time?): Date {
    const dateStr: Date = this.dayjsTool(time).add(8, 'hour').toDate();
    return dateStr;
  }

  addTime(time, value, unit = 'hour', format = DATE_FORMATE): Date {
    const date = this.dayjsTool(time).add(value, unit).format(format);
    return date;
  }

  bigEq(a: BigParam, b: BigParam): boolean {
    return new BigNumber(a).eq(b);
  }

  bigLt(a: BigParam, b: BigParam): boolean {
    return new BigNumber(a).lt(b);
  }

  bigLte(a: BigParam, b: BigParam): boolean {
    return new BigNumber(a).lte(b);
  }

  bigGt(a: BigParam, b: BigParam): boolean {
    return new BigNumber(a).gt(b);
  }

  bigGte(a: BigParam, b: BigParam): boolean {
    return new BigNumber(a).gte(b);
  }

  bigDiv(a: BigParam, b: BigParam): BigNumber {
    if (+a === 0) return new BigNumber(0);

    return new BigNumber(a).dividedBy(b);
  }

  bigMinus(...args: BigParam[]): BigNumber {
    let res = new BigNumber(args.shift());
    for (const arg of args) {
      res = res.minus(arg);
    }
    return res;
  }

  bigAdd(...args: BigParam[]): BigNumber {
    const res = args.reduce((pre, item) => {
      if (pre instanceof BigNumber) {
        pre = pre.plus(item);
      } else {
        pre = new BigNumber(pre).plus(item);
      }

      return pre;
    }, new BigNumber(0));

    return res as BigNumber;
  }

  bigMultiply(...args: BigParam[]): BigNumber {
    let res = new BigNumber(1);
    for (const item of args) {
      res = res.multipliedBy(item);
    }

    return res;
  }

  getMin(...args: BigParam[]): BigNumber {
    let min;
    let start = false;
    for (const item of args) {
      if (!start) {
        min = new BigNumber(item);
        start = true;
      }

      if (min.minus(new BigNumber(item)) >= 0) {
        min = new BigNumber(item);
      }
    }
    return min;
  }

  mapToArray(map: Map<string, any>) {
    const arr = [];
    for (const [key, value] of map) {
      arr.push({
        [key]: value,
      });
    }

    return arr;
  }

  mapToObject(map: Map<string, any>) {
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = value;
    }
    return obj;
  }

  objectToMap(obj: object) {
    const map = new Map();
    for (const key in obj) {
      map.set(key, obj[key]);
    }
    return map;
  }

  createOrderNo() {
    const date = new Date();
    return (
      date.getFullYear() +
      _.padStart(`${date.getMonth() + 1}`, 2, '0') +
      _.padStart(`${date.getDate()}`, 2, '0') +
      _.padStart(`${date.getHours()}`, 2, '0') +
      _.padStart(`${date.getMinutes()}`, 2, '0') +
      _.padStart(`${date.getSeconds()}`, 2, '0') +
      _.padStart(`${date.getMilliseconds()}`, 3, '0') +
      _.random(100, 999)
    );
  }

  generateCode(length: number, charset = 'alphabetic'): string {
    const randomString: string = randomstring.generate({
      length,
      charset,
    });
    return randomString.toLowerCase();
  }

  getGoogleSecret() {
    const result = speakeasy.generateSecret({ length: 20 });
    return { secret: result.base32 };
  }

  checkGoogleVerify(secret: string, code: string): boolean {
    const res = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
    });
    if (!res) {
      throw new MyError('google code error', ErrorLevelEnum.P4);
    }
    return res;
  }

  dealDecimal(num: BigNumber, length: number) {
    return num.toFixed(length, BigNumber.ROUND_DOWN);
  }

  maskEmail(email) {
    return email.replace(/(.{0,2}).*@(.*)/, '$1****@$2');
  }

  async getJwtToken(userId: string, email: string) {
    const token = await this.jwtService.sign({
      userId,
      email,
    });
    return token;
  }

  generateSalt(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  hashPassword(password: string, salt: string): string {
    return crypto
      .pbkdf2Sync(password + '', salt, 1000, 64, 'sha512')
      .toString('hex');
  }
}
