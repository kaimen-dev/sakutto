import { ref } from "vue";
import { defineStore, storeToRefs } from "pinia";
import { useStorage } from "@vueuse/core";
import { getDBUsage, countDBImageByDate, type DBUsageStatus } from "../js/IDB";
type AppStatusText = string;
type SAKUTTO_settings = {
  savedDBImageLimit: number;
};
const sakutto_settings = ref<SAKUTTO_settings>({ savedDBImageLimit: 600 });

const useSettingsStore = defineStore("settings", () => {
  const settings = useStorage("sakutto_settings", sakutto_settings);
  const appStatusText = ref<AppStatusText>("");
  const useThemeFont = ref<boolean>(true);
  const DBUsage = ref<number>(0);
  const DBImageCount = ref<number>(0);
  function updateDBUsage() {
    return new Promise<DBUsageStatus>((resolve) => {
      getDBUsage().then((data) => {
        console.log(data);
        if (!data.usage || !data.quota) return (DBUsage.value = 0);
        DBUsage.value = Math.round((data.usage / data.quota) * 10000) / 100;
        DBImageCount.value = data.count;
        resolve(data);
      });
    });
  }
  return {
    settings,
    appStatusText,
    useThemeFont,
    DBUsage,
    DBImageCount,
    updateDBUsage,
  };
});

export { storeToRefs, useSettingsStore };
