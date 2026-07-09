<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { stockMovementsService } from '@/services/stockMovements.service'
import type { StockMovement, MovementType, PaginationParams } from '@/types'
import { formatDate, getUnitLabel } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { Search, X, ArrowDownToLine, ArrowUpFromLine, Filter } from 'lucide-vue-next'
import EmptyState from '@/components/shared/EmptyState.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import PaginationControls from '@/components/shared/PaginationControls.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const movements = ref<StockMovement[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const search = ref('')
const typeFilter = ref<MovementType | ''>('')
const searchTimeout = ref<ReturnType<typeof setTimeout>>()

async function fetchMovements() {
  loading.value = true
  try {
    const params: PaginationParams & { type?: MovementType } = {
      page: page.value,
      limit: 15,
      search: search.value || undefined,
      ...(typeFilter.value ? { type: typeFilter.value } : {}),
    }
    const res = await stockMovementsService.getAll(params)
    movements.value = res.data
    totalPages.value = res.meta.totalPages
    total.value = res.meta.total
  } catch { toast.error('Gagal memuat riwayat stok') }
  finally { loading.value = false }
}

watch(search, () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => { page.value = 1; fetchMovements() }, 300)
})
watch([page, typeFilter], () => { if (page.value === 1) fetchMovements(); else page.value = 1 })
onMounted(fetchMovements)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Riwayat Stok</h2>
      <p class="text-sm text-muted-foreground">Lihat semua riwayat pergerakan stok inventaris</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative max-w-sm flex-1">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input v-model="search" type="text" placeholder="Cari produk atau catatan..." class="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <button v-if="search" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="search = ''"><X class="h-4 w-4" /></button>
      </div>

      <div class="flex items-center gap-2">
        <Filter class="h-4 w-4 text-muted-foreground" />
        <select v-model="typeFilter" class="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Semua Tipe</option>
          <option value="IN">Masuk</option>
          <option value="OUT">Keluar</option>
        </select>
      </div>
    </div>

    <LoadingSkeleton v-if="loading" :rows="8" :cols="6" />

    <EmptyState v-else-if="!movements.length" title="Belum ada riwayat" description="Riwayat pergerakan stok akan muncul setelah ada transaksi stok masuk atau keluar." />

    <div v-else class="overflow-hidden rounded-xl border border-border bg-card">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground">Tanggal</th>
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground">Produk</th>
              <th class="px-5 py-3 text-center font-semibold text-muted-foreground">Tipe</th>
              <th class="px-5 py-3 text-center font-semibold text-muted-foreground">Jumlah</th>
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">User</th>
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Catatan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="m in movements" :key="m.id" class="transition-colors hover:bg-muted/20">
              <td class="px-5 py-3 text-muted-foreground whitespace-nowrap">{{ formatDate(m.createdAt) }}</td>
              <td class="px-5 py-3">
                <div class="font-medium text-foreground">{{ m.product?.name }}</div>
                <div class="text-xs text-muted-foreground">{{ m.product?.sku }}</div>
              </td>
              <td class="px-5 py-3 text-center"><StatusBadge :type="m.type" /></td>
              <td class="px-5 py-3 text-center">
                <span :class="['font-semibold', m.type === 'IN' ? 'text-emerald-600' : 'text-red-600']">
                  {{ m.type === 'IN' ? '+' : '-' }}{{ m.quantity }}
                </span>
                <span class="text-muted-foreground ml-1">{{ getUnitLabel(m.product?.unit || '') }}</span>
              </td>
              <td class="px-5 py-3 text-muted-foreground hidden md:table-cell">{{ m.user?.name }}</td>
              <td class="px-5 py-3 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{{ m.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3"><PaginationControls :currentPage="page" :totalPages="totalPages" :total="total" @update:currentPage="page = $event" /></div>
    </div>
  </div>
</template>
