<template>
  <div class="create_cover mt-4 pt-4">
    <div>
      <p class="text-center font-bold">
        表紙を作成できます。(2番目のシートに保存されます)
      </p>
      <div class="flex justify-center gap-4 mb-6">
        <span v-if="useCover" class="w-28">表紙を使う</span>
        <span v-else class="w-28">表紙を使わない</span>
        <Switch :checked="useCover" @update:checked="changeUseCover">
          <template #thumb>
            <Icon v-if="useCover" class="size-3" />
            <Icon v-else class="size-3" />
          </template>
        </Switch>
      </div>
    </div>
    <div class="flex justify-center gap-4 mb-6">
      <Card class="w-full max-w-lg" :style="{ opacity: useCover ? 1 : 0.3 }">
        <CardHeader>
          <CardTitle>表紙の詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div class="grid items-center w-full gap-4">
              <label class="w-24">件名</label>
              <input
                v-model="construction.subject"
                :disabled="!useCover"
                class="w-full" />
              <label class="w-24">工事名</label>
              <input
                v-model="construction.name"
                :disabled="!useCover"
                class="w-full" />
              <label class="w-24">工事期間</label>
              <input
                v-model="construction.period"
                :disabled="!useCover"
                class="w-full" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    <h3 class="text-center text-2xl">プレビュー</h3>
    <div>
      <div
        v-if="useCover"
        class="flex justify-center items-center"
        style="height: calc(297mm / 2)">
        <div class="A4 mintyo">
          <div class="page_spacer" style="height: 3.7cm"></div>
          <div class="page_title">
            <h1
              class="underline"
              style="height: 1.56cm; font-size: 36px; text-align: center">
              工事報告書
            </h1>
          </div>
          <div class="page_spacer" style="height: 4.66cm"></div>
          <!-- HTML上で半角スペース＝&#x2002; 全角スペース＝&#x2003; https://eslint.org/docs/latest/rules/no-irregular-whitespace -->
          <div id="construction_subject" class="construction_detail">
            <span
              >【件&#x2003;&#x2003;名】&#x2003;{{ construction.subject }}</span
            >
          </div>
          <div class="page_spacer" style="height: 1.75cm"></div>
          <div id="construction_name" class="construction_detail">
            <span
              >【工&#x2002;事&#x2002;名】&#x2003;{{ construction.name }}</span
            >
          </div>
          <div class="page_spacer" style="height: 1.75cm"></div>
          <div id="construction_period" class="construction_detail">
            <span
              >【工&#x2003;&#x2003;期】&#x2003;{{ construction.period }}</span
            >
          </div>
          <div class="page_spacer" style="height: 2.33cm"></div>

          <div
            class="page_spacer rogo"
            style="height: 1.75cm"
            :style="imageStyle"></div>

          <h1 class="underline" style="text-align: center">
            {{ construction.company_name }}
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
type Construction = {
  subject: string;
  name: string;
  period: string;
  company_name: string;
  rogo: string;
};
const props = defineProps<{
  modelValue: Construction;
}>();
const useCover = defineModel("useCover", {
  type: Boolean,
});
const imageStyle = computed(() => {
  return {
    backgroundImage: `url(${construction.value.rogo})`,
  };
});
// const use_cover = ref(props.useCover);

const emits = defineEmits<{
  (e: "update:modelValue", value: Construction): void;
}>();

const construction = computed({
  get: () => props.modelValue,
  set: (inputted) => emits("update:modelValue", inputted),
});

function changeUseCover(use: boolean) {
  useCover.value = use;
  // emits("changeUseCover", use);
}
</script>

<style scoped>
.mintyo {
  font-family: "Times New Roman", "YuMincho", "Hiragino Mincho ProN",
    "Yu Mincho", "MS PMincho", serif;
}
form input {
  border-bottom: 1px solid #000;
}
.A4 {
  aspect-ratio: 1 / 1.414;
  transform: scale(0.5);
  width: 210mm;
  height: 297mm;
  padding: 1.91cm 1.78cm;
  border: 1px solid #000;
}
.page_spacer {
  display: block;
}
.construction_detail {
  display: flex;
  align-items: end;
  width: 100%;
  height: 1.75cm;
  border-bottom: 2px solid #000;
}
.construction_detail span {
  font-size: 20px;
  font-weight: bold;
}
.rogo {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
