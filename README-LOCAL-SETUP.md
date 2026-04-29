# CP-EMS-RUOYI 本地启动指南

本项目已完成初步配置，适配本地开发环境。

## 1. 环境准备
请确保本地已安装以下工具并配置好环境变量：
- **Java JDK 8+**
- **Maven 3.6+**
- **MySQL 5.7+**
- **Redis 3.0+**
- **Node.js 14+**

## 2. 数据库初始化
1. 创建数据库：`cp_ems_ruoyi`
2. 导入数据脚本：
   - 主数据：`script/sql/cp_ems.sql`
   - (可选) 任务调度：`script/sql/cp_ems_xxl_job.sql`

## 3. 启动后端
后端端口已配置为 **8088**。
```bash
cd cp-ems-ruoyi
mvn clean package -DskipTests
cd cp-ems-admin/target
java -jar cp-ems-admin.jar
```

## 4. 启动前端
前端端口已配置为 **8008**，代理指向 **8088**。
```bash
cd cp-ems-ruoyi/cp-ems-ui
npm install  # (如果之前未安装成功)
npm run dev
```

## 5. 访问系统
- 访问地址：http://localhost:8008
- 默认账号：admin
- 默认密码：admin123 (具体见数据库初始化数据)

## 6. 配置修改记录
- **后端端口**：`8088` (修改文件: `cp-ems-admin/src/main/resources/application.yml`)
- **数据库名**：`cp_ems_ruoyi` (修改文件: `cp-ems-admin/src/main/resources/application-dev.yml`)
- **Redis库**：`2` (修改文件: `cp-ems-admin/src/main/resources/application-dev.yml`)
- **前端端口**：`8008` (修改文件: `cp-ems-ui/vue.config.js`)
- **前端代理**：`http://localhost:8088` (修改文件: `cp-ems-ui/vue.config.js`)
