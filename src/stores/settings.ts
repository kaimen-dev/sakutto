import { ref } from "vue";
import { defineStore, storeToRefs } from "pinia";
import { useStorage } from "@vueuse/core";
type AppStatusText = string;
type SAKUTTO_settings = {
  savedDBImageLimit: number;
};
const sakutto_settings = ref<SAKUTTO_settings>({ savedDBImageLimit: 500 });

const useSettingsStore = defineStore("settings", () => {
  const settings = useStorage("sakutto_settings", sakutto_settings);
  const appStatusText = ref<AppStatusText>("");
  const useThemeFont = ref<boolean>(true);

  return { settings, appStatusText, useThemeFont };
});

export { storeToRefs, useSettingsStore };
