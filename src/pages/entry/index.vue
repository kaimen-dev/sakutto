<route>
  {
    meta: {
      appLink: 1,
      name_ja: "会社情報",
      description_ja: "共有する会社情報を登録",
    }
  }
</route>
<script setup lang="ts">
import { useCompanyStore } from "@/stores/company";
import { storeToRefs } from "pinia";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button/Button.vue";
const store = useCompanyStore();
const { company } = storeToRefs(store);

const uploadHundler = async (e: Event) => {
  const imageWidth = 300;
  const file = (e.target as HTMLInputElement).files![0];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const image = new Image();
  if (!file || !ctx) return;

  canvas.width = imageWidth;
  image.src = URL.createObjectURL(file);
  image.onload = () => {
    const imageAspectRatio = image.height / image.width;
    const height = canvas.width * imageAspectRatio;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, canvas.width, height);
    const base64 = canvas.toDataURL("image/png");
    company.value.ロゴ画像 = base64;
  };
  image.onabort = () => {
    console.log("画像の読み込みに失敗しました");
  };
};

const zipToAddress = async (e: Event) => {
  e.preventDefault();
  const zip = company.value.郵便番号;
  if (!zip && zip.length !== 7) return;
  const res = await fetch(
    `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`
  );
  const data = await res.json();
  console.log(data);
  if (data.results) {
    company.value.都道府県 = data.results[0].address1;
    company.value.住所1 = data.results[0].address2;
    company.value.住所2 = data.results[0].address3;
  }
};
</script>
<template>
  <div>
    <div class="mb-8 px-2">
      <h1
        class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        会社情報
      </h1>
      <p>会社情報を登録します<br />情報はツール内で自動的に反映されます<br/>項目は開発に合わせて追加されていきます</p>
    </div>
    <div class="flex flex-col items-center justify-center">
      <form class="w-full max-w-lg">
        <label
          >会社名

          <Input type="text" placeholder="未入力" v-model="company.会社名"
        /></label>

        <p>例:株式会社○○</p>

        <label
          >代表者名

          <Input type="text" placeholder="未入力" v-model="company.代表者名"
        /></label>

        <p>例:山田太郎、代表取締役　山田次郎</p>

        <div class="hidden">
          <div class="flex items-center gap-4">
            <label
              >郵便番号

              <Input
                type="text"
                placeholder="未入力"
                v-model="company.郵便番号"
                class="w-[7em]" />
            </label>
            <Button class="mt-4" @click="zipToAddress"
              >郵便番号から住所を自動入力</Button
            >
          </div>
          <p>ハイフンなし(例:1234567)</p>

          <label
            >都道府県

            <Input
              type="text"
              placeholder="未入力"
              v-model="company.都道府県"
              class="w-[7em]" />
          </label>
          <p>例:東京都</p>

          <label
            >住所(市区町村)

            <Input type="text" placeholder="未入力" v-model="company.住所1" />
          </label>
          <p>例:千代田区</p>

          <label
            >町番地

            <Input type="text" placeholder="未入力" v-model="company.住所2" />
          </label>
          <p>例:丸の内一丁目</p>

          <label
            >建物名

            <Input type="text" placeholder="未入力" v-model="company.建物名" />
          </label>
          <p>例:○○ビル1F</p>

          <label
            >電話番号

            <Input
              type="text"
              placeholder="未入力"
              v-model="company.電話番号"
              class="w-[11em]" />
          </label>
          <p>ハイフンなし(例:0332100077)</p>

          <label
            >FAX番号

            <Input
              type="text"
              placeholder="未入力"
              v-model="company.FAX番号"
              class="w-[11em]" />
          </label>
          <p>ハイフンなし(例:0332100078)</p>

          <label
            >メールアドレス

            <Input
              type="text"
              placeholder="未入力"
              v-model="company.メールアドレス" />
          </label>
          <p>例:user@example.com</p>
        </div>
        <span>ロゴ画像</span>
        <div v-if="company.ロゴ画像">
          <img :src="company.ロゴ画像" alt="" style="width: 300px" />
        </div>
        <!-- <canvas id="canvas" width="200" height="200"></canvas> -->
        <label>アップロード</label>

        <Input type="file" @change="uploadHundler" />
      </form>
    </div>
  </div>
</template>
<style scoped>
form label {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
form p {
  font-size: 0.8rem;
  color: var(--slate-400);
  margin: 0;
  margin-bottom: 1.5rem;
}
input:empty::placeholder {
  color: var(--red-200);
}
</style>
