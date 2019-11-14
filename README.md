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
