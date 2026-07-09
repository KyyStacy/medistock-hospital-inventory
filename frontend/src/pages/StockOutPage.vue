<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { productsService } from '@/services/products.service'
import { inventoryService } from '@/services/inventory.service'
import type { Product } from '@/types'
import { getUnitLabel } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { ArrowUpFromLine, Loader2, CheckCircle, Package, AlertTriangle } from 'lucide-vue-next'

const products = ref<Product[]>([])
const loading = ref(true)
const submitting = ref(false)
const success = ref(false)

const form = ref({
  productId: '',
  quantity: 1,
  notes: '',
})

onMounted(async () => {
  try {
    const res = await productsService.getAll({ limit: 100 })
    products.value = res.data
  } catch { toast.error('Gagal memuat produk') }
  finally { loading.value = false }
})

const selectedProduct = ref<Product | null>(null)

function onProductChange() {
  selectedProduct.value = products.value.find(p => p.id === form.value.productId) || null
}

const isOverStock = computed(() => {
  if (!selectedProduct.value) return false
  return form.value.quantity > selectedProduct.value.currentStock
})

async function handleSubmit() {
  if (!form.value.productId) { toast.error('Pilih produk terlebih dahulu'); return }
  if (form.value.quantity < 1) { toast.error('Kuantitas harus lebih dari 0'); return }
  if (isOverStock.value) { toast.error('Kuantitas melebihi stok yang tersedia'); return }

  submitting.value = true
  try {
    await inventoryService.stockOut({
      productId: form.value.productId,
      quantity: form.value.quantity,
      notes: form.value.notes || undefined,
    })
    toast.success('Stok keluar berhasil dicatat!')
    success.value = true
    setTimeout(() => {
      success.value = false
      form.value = { productId: '', quantity: 1, notes: '' }
      selectedProduct.value = null
    }, 2000)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal mencatat stok keluar')
  } finally { submitting.value = false }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
          <ArrowUpFromLine class="h-5 w-5 text-red-600" />
        </div>
        Stok Keluar
      </h2>
      <p class="mt-2 text-sm text-muted-foreground">Catat pengurangan stok produk dari inventaris</p>
    </div>

    <div v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center animate-fade-in">
      <CheckCircle class="mx-auto h-12 w-12 text-emerald-500" />
      <h3 class="mt-4 text-lg font-semibold text-emerald-800">Stok Keluar Berhasil!</h3>
      <p class="mt-1 text-sm text-emerald-600">Data pergerakan stok telah tercatat</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="rounded-xl border border-border bg-card p-6 space-y-5">
      <div class="space-y-2">
        <label class="text-sm font-medium">Pilih Produk *</label>
        <select v-model="form.productId" @change="onProductChange" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">-- Pilih Produk --</option>
          <option v-for="p in products" :key="p.id" :value="p.id">{{ p.sku }} - {{ p.name }} (Stok: {{ p.currentStock }})</option>
        </select>
      </div>

      <div v-if="selectedProduct" class="rounded-lg border border-border bg-muted/30 p-4">
        <div class="flex items-center gap-3">
          <Package class="h-5 w-5 text-muted-foreground" />
          <div>
            <p class="text-sm font-medium">{{ selectedProduct.name }}</p>
            <p class="text-xs text-muted-foreground">Stok tersedia: <span class="font-semibold text-foreground">{{ selectedProduct.currentStock }}</span> {{ getUnitLabel(selectedProduct.unit) }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Kuantitas *</label>
        <input v-model.number="form.quantity" type="number" min="1" :max="selectedProduct?.currentStock || 999999" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <div v-if="isOverStock" class="flex items-center gap-2 text-xs text-destructive">
          <AlertTriangle class="h-3.5 w-3.5" />
          Kuantitas melebihi stok yang tersedia ({{ selectedProduct?.currentStock }})
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Catatan</label>
        <textarea v-model="form.notes" rows="3" placeholder="Contoh: Distribusi ke IGD" class="flex w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
      </div>

      <button type="submit" class="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 font-medium text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50" :disabled="submitting || isOverStock">
        <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
        <ArrowUpFromLine v-else class="h-4 w-4" />
        {{ submitting ? 'Memproses...' : 'Catat Stok Keluar' }}
      </button>
    </form>
  </div>
</template>
