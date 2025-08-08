# Midway.js 后台管理系统基础框架

一个基于 Midway.js + Koa + Sequelize 的 RESTful API 基础框架，提供开箱即用的业务开发功能。

## 功能特性

### 核心功能

- ✅ RESTful API 设计
- ✅ JWT 认证与授权
- ✅ 请求参数验证
- ✅ 统一响应格式
- ✅ Swagger 文档集成

### 系统功能

- 📝 请求日志中间件
- ⏱️ 定时任务支持
- 🔒 Redis 集成与工具类封装
- 📊 后台请求日志存储

### ORM 功能

- 🗃️ 表结构自动生成
- 🔍 CRUD 操作
- 🔗 关联查询
- 📜 原生 SQL 查询
- ⚙️ 事务支持
- 📝 查询日志

### 工程化

- 🐳 Docker 集成
- 🧪 单元测试覆盖
- 🛠️ Git Hooks (Husky)
- ✅ Commit 格式检查
- 🧹 代码风格检查

## 技术栈

- **框架**: Midway.js 3.x + Koa
- **数据库**: Sequelize ORM
- **缓存**: Redis
- **文档**: Swagger UI
- **测试**: Mocha + Chai
- **工具**: ESLint + Prettier + Husky

## 项目结构

```
├── src/
│   ├── app/                # 业务代码
│   │   ├── controller/     # 控制器
│   │   ├── service/        # 服务层
│   │   ├── entity/         # 数据库实体
│   │   ├── model/          # 数据模型(DTO/VO)
│   │   └── mapping/        # 数据映射
│   ├── config/             # 配置文件
│   ├── core/               # 核心基础类
│   ├── middleware/         # 中间件
│   └── filter/             # 过滤器
├── test/                   # 测试代码
├── sql/                    # 数据库脚本
└── tools/                  # 开发工具
```

## 快速开始

### 环境准备

1. Node.js 16+
2. MySQL 5.7+
3. Redis

### 安装依赖

```bash
npm install
```

### 配置设置

1. 复制 `.env.demo` 为 `.env` 并修改配置
2. 执行数据库初始化脚本:

```bash
mysql -u root -p < ./sql/test.sql
```

### 启动开发服务器

```bash
npm run dev
```

访问 Swagger 文档: http://localhost:7001/swagger-ui/index.html

## 开发指南

### 生成实体类

```bash
npx sequelize-auto-midway -h localhost -d yourDB -u root -x password -p 3306 \
  --dialect mysql -o ./src/app/entity --noInitModels true \
  --caseModel c --caseProp c --caseFile c --indentation 1 \
  -a ./additional.json
```

### 根据实体类生成映射类文件

```bash
node ./tools/generate-entity-files.js -e src/app/entity/[实体类名].ts
```

### 生成数据库文档

```bash
npx db2md g -u root -p 3306 -pwd password -h 127.0.0.1 dbname -o ./sql
```

## API 文档

项目集成了 Swagger UI，启动后访问:
http://localhost:7001/swagger-ui/index.html

## 部署

### Docker 部署

```bash
docker-compose up -d
```

### 生产环境优化

- 配置 Nginx 反向代理
- 启用 Gzip 压缩
- 设置合理的日志轮转
