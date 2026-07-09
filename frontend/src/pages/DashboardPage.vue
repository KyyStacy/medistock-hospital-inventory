<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dashboardService } from '@/services/dashboard.service'
import type { DashboardData } from '@/types'
import { formatDate, getStockStatus } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import {
  Package,
  Tags,
  Truck,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingDown,
} from 'lucide-vue-next'

const data = ref<DashboardData | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    data.value = await dashboardService.getDashboard()
  } catch (error) {
    console.error('Gagal memuat dashboard:', error)
  } finally {
    loading.value = false
  }
})

const statCards = [
  { key: 'totalProducts', label: 'Total Produk', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'totalCategories', label: 'Total Kategori', icon: Tags, color: 'text-violet-600', bg: 'bg-violet-50' },
  { key: 'totalSuppliers', label: 'Total Supplier', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'lowStockProducts', label: 'Stok Rendah', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <LoadingSkeleton v-if="loading" :rows="3" :cols="4" />

    <template v-else-if="data">
      <!-- Summary Bento Grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <div
          v-for="(card, index) in statCards"
          :key="card.key"
          :class="[
            'group relative overflow-hidden rounded-md border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]',
            index === 0 ? 'sm:col-span-2 xl:col-span-2' : 'sm:col-span-1 xl:col-span-2',
            index === 3 ? 'sm:col-span-3 xl:col-span-2' : ''
          ]"
        >
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px]">{{ card.label }}</p>
              <p class="text-4xl font-semibold tracking-tighter text-foreground tabular-nums">
                {{ data.summary[card.key as keyof typeof data.summary] }}
              </p>
            </div>
            <div class="flex h-8 w-8 items-center justify-center rounded bg-muted/50 text-muted-foreground transition-colors group-hover:text-foreground">
              <component :is="card.icon" class="h-4 w-4" :stroke-width="1.5" />
            </div>
          </div>
          <!-- Subtle bottom accent line -->
          <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-primary opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100"
               :class="card.key === 'lowStockProducts' ? '!bg-destructive' : ''" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <!-- Recent Activities -->
        <div class="xl:col-span-3 rounded-md border border-border bg-card shadow-sm">
          <div class="border-b border-border px-6 py-5 flex items-center justify-between">
            <h2 class="text-base font-semibold tracking-tight text-foreground">Recent Activity</h2>
            <p class="text-xs font-mono text-muted-foreground uppercase tracking-wider">Live Log</p>
          </div>
          <div class="divide-y divide-border">
            <div
              v-for="activity in data.recentActivities"
              :key="activity.id"
              class="flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-muted/30 hover:-translate-y-[1px]"
            >
              <div
                :class="[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded border',
                  activity.type === 'IN' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'
                ]"
              >
                <ArrowDownToLine v-if="activity.type === 'IN'" class="h-4 w-4" :stroke-width="1.5" />
                <ArrowUpFromLine v-else class="h-4 w-4" :stroke-width="1.5" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-foreground">{{ activity.product.name }}</p>
                <div class="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span class="font-mono">{{ activity.product.sku }}</span>
                  <span>&middot;</span>
                  <span>{{ activity.user.name }}</span>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p :class="['text-sm font-semibold tabular-nums', activity.type === 'IN' ? 'text-success' : 'text-destructive']">
                  {{ activity.type === 'IN' ? '+' : '-' }}{{ activity.quantity }}
                </p>
                <p class="text-xs text-muted-foreground mt-0.5">{{ formatDate(activity.createdAt) }}</p>
              </div>
            </div>
          </div>
          <div v-if="!data.recentActivities.length" class="py-12 text-center text-sm text-muted-foreground">
            No activities yet
          </div>
        </div>

        <!-- Low Stock Alert -->
        <div class="xl:col-span-2 rounded-md border border-border bg-card shadow-sm">
          <div class="border-b border-border px-6 py-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <TrendingDown class="h-4 w-4 text-destructive" :stroke-width="1.5" />
              <h2 class="text-base font-semibold tracking-tight text-foreground">Stock Alerts</h2>
            </div>
          </div>
          <div class="divide-y divide-border">
            <div
              v-for="item in data.lowStockItems"
              :key="item.id"
              class="px-6 py-4 transition-all duration-200 hover:bg-muted/30 hover:-translate-y-[1px]"
            >
              <div class="flex items-start justify-between">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-foreground">{{ item.name }}</p>
                  <p class="text-xs font-mono text-muted-foreground mt-0.5">{{ item.sku }}</p>
                </div>
                <StatusBadge :type="getStockStatus(item.currentStock, item.minimumStock)" />
              </div>
              <div class="mt-3 flex items-center justify-between text-xs border-t border-border/50 pt-3">
                <div class="flex items-center gap-1.5">
                  <span class="text-muted-foreground">Current:</span>
                  <span class="font-semibold tabular-nums text-foreground">{{ item.currentStock }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-muted-foreground">Min required:</span>
                  <span class="font-semibold tabular-nums">{{ item.minimumStock }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!data.lowStockItems.length" class="py-12 text-center text-sm text-muted-foreground">
            All stock levels optimal
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
