<template>
  <article class="articleBox bg-white dark:bg-black">
    <div class="image"></div>
    <div class="number_title">写真番号　　　 No.</div>
    <div class="number"></div>
    <div class="place_title">場所</div>
    <div class="place"></div>
    <div class="summary_title">内容</div>
    <div class="summary"></div>
    <div class="detail_title">詳細</div>
    <div class="detail"></div>
  </article>
</template>

<script setup lang="ts"></script>

<style scoped>
.articleBox {
  display: grid;
  grid-template-columns: 406.078px 134.7px 110.906px;
  grid-template-rows: 32px 18px 47.7969px 18px 59px 18px 113.266px 13.2656px;
  gap: 0px 0px;
  grid-template-areas:
    "image number_title number"
    "image place_title place_title"
    "image place place"
    "image summary_title summary_title"
    "image summary summary"
    "image detail_title detail_title"
    "image detail detail"
    ". . .";

  font-size: 11pt;
  line-height: 1.2;
}
.image {
  border: 1px solid #000;
}
.number,
.place,
.summary,
.detail {
  border-right: 1px solid #000;
}
.detail {
  border-bottom: 1px solid #000;
}
.number_title,
.number,
.place_title,
.summary_title,
.detail_title {
  border-right: 1px solid #000;
  border-top: 1px solid #000;
}
.number_title {
  border-right: none;
}
.place_title,
.summary_title,
.detail_title {
  border-bottom: 1px solid #ccc;
}

.image {
  border: 1px solid #000;
  grid-area: image;
}
.number_title {
  grid-area: number_title;
  display: flex;
  align-items: center;
}
.number {
  grid-area: number;
  display: flex;
  align-items: center;
  justify-content: center;
}
.place_title {
  grid-area: place_title;
}
.place {
  grid-area: place;
  text-align: center;
}
.summary_title {
  grid-area: summary_title;
}
.summary {
  grid-area: summary;
}
.detail_title {
  grid-area: detail_title;
}
.detail {
  grid-area: detail;
}
</style>
