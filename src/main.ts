import "./assets/index.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

async function getUser() {
  const url = `/api/getUser`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`レスポンスステータス: ${response.status}`);
    }

    const text = await response.text();
    sessionStorage.setItem("user_id", text);
    console.log(sessionStorage.getItem("user_id"));
  } catch (error: any) {
    console.error(error.message);
  }
}
getUser();

// fetch(`/api/getUser`)
//   .then((res) => {
//     if (!res.ok) {
//       throw new Error(`${res.status} ${res.statusText}`);
//     }
//     return res.text();
//   })
//   .then((text) => {
//     console.log(text);
//     sessionStorage.setItem("account_id", text);
//   })
//   .catch((reason) => {
//     console.log(reason);
//   });
const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
