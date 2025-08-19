import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo): MidwayConfig => {
  const config = {} as MidwayConfig;

  config.keys = appInfo.name + '_1640593084642_6476';

  config.accessLogConfig = {
    ignore: [/\/swagger-u.*/u],
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.jwt = {
    secret: '123456',
    expiresIn: 1000 * 60 * 60 * 24,
  };

  config.jwtWhitelist = [
    '/swagger-ui',
    '/api',
    '/api/user',
    '/metrics',
    '/api/admin/add',
    '/api/admin/login',
    '/api/user/register',
    '/api/user/login',
    '/api/user/forget/password',
    '/api/user/reset/password',
  ];

  config.cors = {
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    origin: req => req.headers.origin,
  };

  config.sequelize = {
    dataSource: {
      default: {
        dialect: 'mysql',
        define: {
          timestamps: true, // 是否需要增加createdAt、updatedAt、deletedAt字段
          paranoid: true, // 此种模式下，删除数据时不会进行物理删除，而是设置deletedAt为当前时间
          underscored: true, // 所有属性设置下划线
          freezeTableName: true, //不会尝试更改模型名以获取表名。否则，型号名称将是复数
          engine: 'innodb', // 默认的存储引擎
        },
        timezone: '+08:00',
        benchmark: true,
        logging: (sql, timing) => {
          // 每次日志输出都会调用的函数，可以在此进行重写
          if (typeof timing === 'number' && timing > 5000) {
            // 记录执行时间超过阈值的sql
            console.warn(`[sequelize](${timing} ms) ${sql}`);
          }
        },
        dialectOptions: {
          // 此处配置将直接传给数据库
          connectTimeout: 30000, // 单次查询连接超时时间
          dateStrings: true, // 不会返回UTC格式时间
          typeCast: true, // 驼峰命名
          bigNumberStrings: true, // bigInt和decimal 以字符串返回
        },
        sync: false, // 本地的时候，可以通过sync: true直接createTable
        entities: ['/app/entity'],
      },
    },
  };

  config.midwayLogger = {
    default: {
      //clients 配置段中的每个对象都是一个独立的日志配置项，其配置会和 default 段落合并后创建 logger 实例。
      maxFiles: '7d',
      level: 'info',
      consoleLevel: 'info',
    },
  };

  config.email = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  };

  config.koa = {
    contextLoggerFormat: info => {
      const ctx = info.ctx;
      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.reqId} - ${
        Date.now() - ctx.startTime
      }ms ${ctx.method} ${ctx.url}] ${info.message}`;
    },
    port: parseInt(process.env.WEB_PORT),
    globalPrefix: '/api',
    serverTimeout: 30 * 1000,
  };

  return config;
};
