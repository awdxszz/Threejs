import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";
import * as Icons from "@ant-design/icons-vue";
import * as THREE from "three";
import "./style.css";
import "uno.css";

// 创建应用实例
const app = createApp(App);

// 全局注册所有图标组件
Object.keys(Icons).forEach((key) => {
  app.component(key, Icons[key]);
});

// 使用路由和Ant Design Vue
app.use(router);
app.use(Antd);

// 全局注册THREE
app.config.globalProperties.THREE = THREE;

// 挂载应用
app.mount("#app");
