<script setup lang="ts">
import { Button } from '@/components/ui/button'


const get = async () => {
    const data = await fetch(`/api/helloworld`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    const parsedJson = await data.text();
    console.log(parsedJson);
  };
</script>

<template>
  <main>
    
    <Button @click="get">HomeView</Button>
  </main>
</template>
