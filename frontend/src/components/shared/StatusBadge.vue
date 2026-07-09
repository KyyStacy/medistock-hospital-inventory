<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
  type: 'IN' | 'OUT' | 'ADMIN' | 'VIEWER' | 'critical' | 'low' | 'normal'
  label?: string
}>()

const variants: Record<string, string> = {
  IN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OUT: 'bg-red-50 text-red-700 border-red-200',
  ADMIN: 'bg-primary/10 text-primary border-primary/20',
  VIEWER: 'bg-blue-50 text-blue-600 border-blue-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  low: 'bg-amber-50 text-amber-700 border-amber-200',
  normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const labels: Record<string, string> = {
  IN: 'Masuk',
  OUT: 'Keluar',
  ADMIN: 'Admin',
  VIEWER: 'Viewer',
  critical: 'Habis',
  low: 'Rendah',
  normal: 'Aman',
}
</script>

<template>
  <span
    :class="cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
      variants[type]
    )"
  >
    {{ label || labels[type] }}
  </span>
</template>
