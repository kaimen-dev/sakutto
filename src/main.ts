import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/**
 * MARK: iconify
 * iconify-vueでアイコンを追加する
 * @see https://iconify.design/docs/icon-sets/vue/
 * アイコンはパッケージ化が必要なので、assets/iconにsvgファイルを追加して、:root/util/iconnify_tools.jsをnodeで実行してjsonファイルを生成する
 * 生成script ->> importSVGforIconify
 */
import { addCollection } from "@iconify/vue";
import icons from "./assets/icons.json";
import {Icon} from "@iconify/vue";
addCollection(icons);

const app = createApp(App)
app.component("Icon", Icon);
app.use(createPinia())
app.use(router)

app.mount('#app')
