import { defineStore, storeToRefs } from "pinia";
import { useStorage } from "@vueuse/core";

type Company = {
  会社名: string;
  代表者名: string;
  郵便番号: string;
  都道府県: string;
  住所1: string;
  住所2: string;
  建物名: string;
  電話番号: string;
  FAX番号: string;
  メールアドレス: string;
  ロゴ画像: string;
};

const defaultCompany: Company = {
  会社名: "",
  代表者名: "",
  郵便番号: "",
  都道府県: "",
  住所1: "",
  住所2: "",
  建物名: "",
  電話番号: "",
  FAX番号: "",
  メールアドレス: "",
  ロゴ画像: "",
};
export const useCompanyStore = defineStore("company", () => {
  const company = useStorage("sakutto_company", defaultCompany);
  function updateCompany(newCompany: Company) {
    company.value = newCompany;
  }

  return { company };
});

export { storeToRefs };
