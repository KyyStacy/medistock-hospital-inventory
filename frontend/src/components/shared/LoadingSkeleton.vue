<script setup lang="ts">
defineProps<{
  rows?: number
  cols?: number
}>()
</script>

<template>
  <div class="w-full animate-pulse space-y-3">
    <div v-for="row in (rows || 5)" :key="row" class="flex gap-4">
      <div
        v-for="col in (cols || 4)"
        :key="col"
        class="h-10 flex-1 rounded-md bg-muted"
        :style="{ animationDelay: `${(row * cols! + col) * 50}ms` }"
      />
    </div>
  </div>
</template>
