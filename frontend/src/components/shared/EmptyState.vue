<script setup lang="ts">
import { PackageOpen } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
  icon?: any
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
      <component :is="icon || PackageOpen" class="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 class="mb-1 text-base font-semibold text-foreground">
      {{ title || 'Tidak ada data' }}
    </h3>
    <p class="max-w-sm text-sm text-muted-foreground">
      {{ description || 'Belum ada data yang tersedia untuk ditampilkan.' }}
    </p>
    <div class="mt-6">
      <slot />
    </div>
  </div>
</template>
