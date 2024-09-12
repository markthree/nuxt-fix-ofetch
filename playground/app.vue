<template>
  <div>{{ data?.toLocaleUpperCase() }} Nuxt module playground!</div>
</template>

<script setup lang="ts">
const { data } = await useFetch("/api/hello");
</script>
