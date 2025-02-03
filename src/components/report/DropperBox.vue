<template>
  <div
    ref="dropZoneRef" class="w-full h-full duration-300" :class="isOverDropZone ? 'bg-slate-200': ''">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * image droppable
 */
import { ref } from "vue";
const emits = defineEmits<{
  (e: "drop", file: File | File[]): void;
}>();
import { useDropZone } from "@vueuse/core";
const dropZoneRef = ref<HTMLDivElement>();
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  // specify the types of data to be received.
  dataTypes: ["image/png", "image/jpeg", "image/gif", "image/jpg", "image/heic"],
  // control multi-file drop
  multiple: true,
  // whether to prevent default behavior for unhandled events
  preventDefaultForUnhandled: false,
});
function onDrop(files: File[] | null, e: DragEvent) {
  if (!files) return;
  const target = e.target as HTMLElement;
  emits("drop", files);
}
</script>

<style scoped>
</style>
