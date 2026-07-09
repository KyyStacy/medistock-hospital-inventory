<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsService } from '@/services/products.service'
import type { Product } from '@/types'
import { formatDate, getUnitLabel, getStockStatus } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import { ArrowLeft, Package, Tags, Truck, ArrowDownToLine, ArrowUpFromLine } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const product = ref<Product | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    product.value = await productsService.getById(route.params.id as string)
  } catch {
    router.push('/products')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <button class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" @click="router.push('/products')">
      <ArrowLeft class="h-4 w-4" /> Kembali ke Produk
    </button>

    <LoadingSkeleton v-if="loading" :rows="4" :cols="3" />

    <template v-else-if="product">
      <!-- Product Info -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <!-- General Info -->
          <div class="rounded-xl border border-border bg-card p-6">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <code class="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">{{ product.sku }}</code>
                  <StatusBadge :type="getStockStatus(product.currentStock, product.minimumStock)" />
                </div>
                <h2 class="text-2xl font-bold tracking-tight text-foreground">{{ product.name }}</h2>
                <p v-if="product.description" class="mt-2 text-sm text-muted-foreground">{{ product.description }}</p>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div class="rounded-lg border border-border p-4">
                <p class="text-xs text-muted-foreground">Stok Saat Ini</p>
                <p :class="['mt-1 text-2xl font-bold', product.currentStock <= product.minimumStock ? 'text-red-600' : 'text-foreground']">
                  {{ product.currentStock }}
                </p>
              </div>
              <div class="rounded-lg border border-border p-4">
                <p class="text-xs text-muted-foreground">Stok Minimum</p>
                <p class="mt-1 text-2xl font-bold text-foreground">{{ product.minimumStock }}</p>
              </div>
              <div class="rounded-lg border border-border p-4">
                <p class="text-xs text-muted-foreground">Satuan</p>
                <p class="mt-1 text-2xl font-bold text-foreground">{{ getUnitLabel(product.unit) }}</p>
              </div>
              <div class="rounded-lg border border-border p-4">
                <p class="text-xs text-muted-foreground">Pergerakan</p>
                <p class="mt-1 text-2xl font-bold text-foreground">{{ product.stockMovements?.length || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Movement History -->
          <div class="rounded-xl border border-border bg-card">
            <div class="border-b border-border px-5 py-4">
              <h3 class="text-base font-semibold">Riwayat Pergerakan</h3>
              <p class="text-xs text-muted-foreground">20 transaksi terakhir</p>
            </div>
            <div v-if="product.stockMovements?.length" class="divide-y divide-border">
              <div v-for="m in product.stockMovements" :key="m.id" class="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
                <div :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', m.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600']">
                  <ArrowDownToLine v-if="m.type === 'IN'" class="h-4 w-4" />
                  <ArrowUpFromLine v-else class="h-4 w-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">
                    <StatusBadge :type="m.type" class="mr-2" />
                    {{ m.quantity }} {{ getUnitLabel(product.unit) }}
                  </p>
                  <p class="text-xs text-muted-foreground">{{ m.notes || '-' }} &middot; {{ m.user?.name }}</p>
                </div>
                <p class="text-xs text-muted-foreground shrink-0">{{ formatDate(m.createdAt) }}</p>
              </div>
            </div>
            <div v-else class="py-12 text-center text-sm text-muted-foreground">
              Belum ada riwayat pergerakan
            </div>
          </div>
        </div>

        <!-- Sidebar Info -->
        <div class="space-y-6">
          <div class="rounded-xl border border-border bg-card p-5">
            <h3 class="text-sm font-semibold text-foreground mb-4">Informasi</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <Tags class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs text-muted-foreground">Kategori</p>
                  <p class="text-sm font-medium">{{ product.category?.name }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Truck class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs text-muted-foreground">Supplier</p>
                  <p class="text-sm font-medium">{{ product.supplier?.name }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Package class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs text-muted-foreground">Dibuat</p>
                  <p class="text-sm font-medium">{{ formatDate(product.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
