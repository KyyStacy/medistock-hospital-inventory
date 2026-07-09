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
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">{{ card.label }}</p>
              <p class="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {{ data.summary[card.key as keyof typeof data.summary] }}
              </p>
            </div>
            <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', card.bg]">
              <component :is="card.icon" :class="['h-5 w-5', card.color]" />
            </div>
          </div>
          <div class="absolute bottom-0 left-0 h-1 w-full opacity-0 transition-opacity group-hover:opacity-100"
               :class="card.key === 'lowStockProducts' ? 'bg-red-500' : 'bg-primary'" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <!-- Recent Activities -->
        <div class="xl:col-span-3 rounded-xl border border-border bg-card">
          <div class="border-b border-border px-5 py-4">
            <h2 class="text-base font-semibold text-foreground">Aktivitas Terbaru</h2>
            <p class="text-xs text-muted-foreground">10 pergerakan stok terakhir</p>
          </div>
          <div class="divide-y divide-border">
            <div
              v-for="activity in data.recentActivities"
              :key="activity.id"
              class="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
            >
              <div
                :class="[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  activity.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                ]"
              >
                <ArrowDownToLine v-if="activity.type === 'IN'" class="h-4 w-4" />
                <ArrowUpFromLine v-else class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-foreground">{{ activity.product.name }}</p>
                <p class="text-xs text-muted-foreground">{{ activity.product.sku }} &middot; {{ activity.user.name }}</p>
              </div>
              <div class="text-right shrink-0">
                <p :class="['text-sm font-semibold', activity.type === 'IN' ? 'text-emerald-600' : 'text-red-600']">
                  {{ activity.type === 'IN' ? '+' : '-' }}{{ activity.quantity }}
                </p>
                <p class="text-xs text-muted-foreground">{{ formatDate(activity.createdAt) }}</p>
              </div>
            </div>
          </div>
          <div v-if="!data.recentActivities.length" class="py-12 text-center text-sm text-muted-foreground">
            Belum ada aktivitas
          </div>
        </div>

        <!-- Low Stock Alert -->
        <div class="xl:col-span-2 rounded-xl border border-border bg-card">
          <div class="border-b border-border px-5 py-4">
            <div class="flex items-center gap-2">
              <TrendingDown class="h-4 w-4 text-red-500" />
              <h2 class="text-base font-semibold text-foreground">Stok Rendah</h2>
            </div>
            <p class="text-xs text-muted-foreground">Produk yang perlu segera di-restock</p>
          </div>
          <div class="divide-y divide-border">
            <div
              v-for="item in data.lowStockItems"
              :key="item.id"
              class="px-5 py-3 transition-colors hover:bg-muted/30"
            >
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-foreground">{{ item.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ item.sku }} &middot; {{ item.categoryName }}</p>
                </div>
                <StatusBadge :type="getStockStatus(item.currentStock, item.minimumStock)" />
              </div>
              <div class="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Stok: <span class="font-semibold text-foreground">{{ item.currentStock }}</span></span>
                <span>Min: <span class="font-semibold">{{ item.minimumStock }}</span></span>
              </div>
            </div>
          </div>
          <div v-if="!data.lowStockItems.length" class="py-12 text-center text-sm text-muted-foreground">
            Semua stok dalam kondisi aman
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
