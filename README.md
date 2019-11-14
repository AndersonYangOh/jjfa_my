# 基于reactnative的个人中心系统
## 一、项目初始化
### 1.创建项目
* react-native init 项目名
### 2.目录结构
* `node_modules/           RN依赖库文件夹`
    `|___package.json            打包脚本，依赖库版本管理文件``
    `|___yarn.lock               依赖库lock文件``
    `|___app.json                app信息文件`
    `|___index.js                RN项目入口文件`
    `|___App.js                  项目文件`
### 3.入口文件
// step 1.引入RN的注册组件API
import { AppRegistry } from 'react-native';
// step 2.引入项目根组件
import App from './App';
// step 3.注册项目根组件
AppRegistry.registerComponent("LearnRN", () => App);
## 二、项目功能说明
### 1.个人中心功能说明
* 基础信息展示：包括姓名、企业等等
* 扩展信息展示：包括支撑次数、支撑金额等等
* 我提供价值：包括回答、提问
* 我的记录：包括方案、产品、案例、收藏、积分
### 2.个人中心操作说明
* 点击跳转功能，跳转对应功能页
* 滑动定位功能，滑动产品定位
