<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  currentPage: number
  totalPages: number
  total: number
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const pages = computed(() => {
  const items: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i)
  } else {
    items.push(1)
    if (current > 3) items.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      items.push(i)
    }
    if (current < total - 2) items.push('...')
    items.push(total)
  }

  return items
})

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div class="flex items-center justify-between border-t border-border pt-4">
    <p class="text-sm text-muted-foreground">
      Total <span class="font-medium text-foreground">{{ total }}</span> data
    </p>

    <div class="flex items-center gap-1" v-if="totalPages > 1">
      <button
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>

      <template v-for="page in pages" :key="page">
        <span v-if="page === '...'" class="px-1 text-muted-foreground">...</span>
        <button
          v-else
          :class="[
            'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
            page === currentPage
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          ]"
          @click="goToPage(page as number)"
        >
          {{ page }}
        </button>
      </template>

      <button
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
