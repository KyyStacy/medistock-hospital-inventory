<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productsService } from '@/services/products.service'
import { inventoryService } from '@/services/inventory.service'
import type { Product } from '@/types'
import { getUnitLabel } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { ArrowDownToLine, Loader2, CheckCircle, Package } from 'lucide-vue-next'

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

async function handleSubmit() {
  if (!form.value.productId) { toast.error('Pilih produk terlebih dahulu'); return }
  if (form.value.quantity < 1) { toast.error('Kuantitas harus lebih dari 0'); return }

  submitting.value = true
  try {
    await inventoryService.stockIn({
      productId: form.value.productId,
      quantity: form.value.quantity,
      notes: form.value.notes || undefined,
    })
    toast.success('Stok masuk berhasil dicatat!')
    success.value = true
    setTimeout(() => {
      success.value = false
      form.value = { productId: '', quantity: 1, notes: '' }
      selectedProduct.value = null
    }, 2000)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal mencatat stok masuk')
  } finally { submitting.value = false }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <ArrowDownToLine class="h-5 w-5 text-emerald-600" />
        </div>
        Stok Masuk
      </h2>
      <p class="mt-2 text-sm text-muted-foreground">Catat penambahan stok produk ke inventaris</p>
    </div>

    <!-- Success state -->
    <div v-if="success" class="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center animate-fade-in">
      <CheckCircle class="mx-auto h-12 w-12 text-emerald-500" />
      <h3 class="mt-4 text-lg font-semibold text-emerald-800">Stok Masuk Berhasil!</h3>
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
            <p class="text-xs text-muted-foreground">Stok saat ini: {{ selectedProduct.currentStock }} {{ getUnitLabel(selectedProduct.unit) }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Kuantitas *</label>
        <input v-model.number="form.quantity" type="number" min="1" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Catatan</label>
        <textarea v-model="form.notes" rows="3" placeholder="Contoh: Pengadaan bulan Juli dari supplier" class="flex w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
      </div>

      <button type="submit" class="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 font-medium text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50" :disabled="submitting">
        <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
        <ArrowDownToLine v-else class="h-4 w-4" />
        {{ submitting ? 'Memproses...' : 'Catat Stok Masuk' }}
      </button>
    </form>
  </div>
</template>
