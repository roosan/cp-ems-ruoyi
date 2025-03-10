# cp-ems-ruoyi - 开源能源管理系统（EMS）

## 项目简介
cp-ems-ruoyi 是一款基于 Ruoyi 框架开发的开源能源管理系统（EMS）。  
该系统为企业和个人提供能耗监控、定额管理和运维管理等功能，支持实时数据采集和分析，帮助用户优化能耗，提升管理效率。  

## 主要功能
0. 数据采集 - 支持 MQTT 通信，实时采集各类设备的能耗数据
1. 设备管理 - 管理设备和网关的台账信息
2. 运维管理 - 包含巡检计划、维修工单等管理功能
3. 能耗分析 - 供能耗概览、同比环比分析、能耗趋势和分项概况等
4. 报警管理 - 实时报警、历史报警、报警规则配置等
5. 定额管理 - 定额配置、用量监测和预警
6. 系统管理 - 用户、权限、日志、系统监控等
7. 其它功能
    * 碳资产管理
    * 能耗分析报告
    * 管理体系管理
    * 视频监控
8. 充电桩应用场景
    * 订单管理
    * 电站、电桩管理
    * 价格策略配置
9. 数据看板  

## 软件架构
前端框架：vue2 + element-ui + ECharts        
后端框架：SpringBoot + Mysql + TDengine + Redis + RabbitMq + MQTT 

## 本地运行支持
https://www.szcloudpulse.com/run-document.html

## 在线体验
演示地址： https://www.szcloudpulse.com:86   
体验账号： EMSUser\123456（沟通请加底部微信）

## 授权模式（可合作销售）
所有功能均可免费自用，项目咨询、获取商业授权、项目分成请通过以下联系方式：  

- 添加微信：  
<img src='docs/联系人二维码.jpg' width='200'><br>
- 电子邮箱，我们将尽快答复  
gzy@szcloudpulse.com  
- 在线留言：  
https://www.szcloudpulse.com/contact.html

## 界面截图
<img src='docs/看板.png' width='600'><br>
<img src='docs/登录页.png' width='600'><br>
<img src='docs/能耗分析.png' width='600'><br>
<img src='docs/定额分析.png' width='600'><br> 

支持深浅两种主题，浅色效果    
<img src='docs/浅色主体.png' width='600'>  

## 配套小程序体验
* 支持查看平台能耗数据
* 支持查看报警记录
* 支持处理巡检、维修工单  

扫码体验   
<img src='docs/小程序二维码.jpg' width='150'><br>

小程序界面  
<img src='docs/小程序截图一.png' width='150'> 
<img src='docs/小程序截图二.png' width='150'> 
<img src='docs/小程序截图三.png' width='150'> 
<img src='docs/小程序截图四.png' width='150'> 

## 技术交流与使用说明  
- 公众号：关注“云脉软件”公众号，获取更多案例和技术支持。  
<img src='docs/公众号二维码.jpg' width='200'><br> 

- 微信咨询：扫码添加微信获取更多咨询。  
<img src='docs/联系人二维码.jpg' width='150'><br>

## 关于我们
苏州云脉软件技术有限公司  
<a href='https://www.szcloudpulse.com' target='_blank'>www.szcloudpulse.com</a>

## 免责声明
本软件为开源项目，提供给个人和企业免费使用。用户在使用本软件时，应自行评估和承担相关的风险。本软件的开发者和贡献者不对使用过程中可能产生的任何直接或间接损失承担责任，包括但不限于数据丢失、业务中断或财务损失。
本软件“按现状”提供，不保证适用于特定用途、无错误或安全可靠。使用本软件即表示用户同意上述条款。

## 其他开源项目  
- 云脉生产管理系统  
本项目是基于ruoyi开发的生产工单管理系统（mes），权限部分沿用了框架自带的体系，其余功能为定制开发，UI样式做了改造。 
<a href='苏州云脉软件技术有限公司/cp-mes-ruoyi' target='_blank'>苏州云脉软件技术有限公司/cp-mes-ruoyi</a>