<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productsService } from '@/services/products.service'
import { categoriesService } from '@/services/categories.service'
import { suppliersService } from '@/services/suppliers.service'
import { useAuthStore } from '@/stores/auth'
import type { Product, Category, Supplier, PaginationParams, Unit } from '@/types'
import { getUnitLabel, getStockStatus } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { Plus, Pencil, Trash2, Search, X, Loader2, Eye, AlertTriangle } from 'lucide-vue-next'
import EmptyState from '@/components/shared/EmptyState.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import PaginationControls from '@/components/shared/PaginationControls.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const router = useRouter()
const authStore = useAuthStore()

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const suppliers = ref<Supplier[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const search = ref('')
const searchTimeout = ref<ReturnType<typeof setTimeout>>()

const showModal = ref(false)
const editingProduct = ref<Product | null>(null)
const formData = ref({
  sku: '', name: '', categoryId: '', supplierId: '', unit: 'PCS' as Unit,
  minimumStock: 0, description: '',
})
const formLoading = ref(false)
const formError = ref('')

const showDeleteDialog = ref(false)
const deletingProduct = ref<Product | null>(null)
const deleteLoading = ref(false)

const units: { value: Unit; label: string }[] = [
  { value: 'PCS', label: 'Pcs' },
  { value: 'BOX', label: 'Box' },
  { value: 'PACK', label: 'Pack' },
  { value: 'BOTTLE', label: 'Botol' },
  { value: 'UNIT', label: 'Unit' },
]

async function fetchProducts() {
  loading.value = true
  try {
    const params: PaginationParams = { page: page.value, limit: 10, search: search.value || undefined }
    const res = await productsService.getAll(params)
    products.value = res.data
    totalPages.value = res.meta.totalPages
    total.value = res.meta.total
  } catch { toast.error('Gagal memuat data produk') }
  finally { loading.value = false }
}

async function fetchOptions() {
  const [catRes, supRes] = await Promise.all([
    categoriesService.getAll({ limit: 100 }),
    suppliersService.getAll({ limit: 100 }),
  ])
  categories.value = catRes.data
  suppliers.value = supRes.data
}

watch(search, () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => { page.value = 1; fetchProducts() }, 300)
})
watch(page, fetchProducts)
onMounted(() => { fetchProducts(); fetchOptions() })

function openCreateModal() {
  editingProduct.value = null
  formData.value = { sku: '', name: '', categoryId: '', supplierId: '', unit: 'PCS', minimumStock: 0, description: '' }
  formError.value = ''
  showModal.value = true
}

function openEditModal(p: Product) {
  editingProduct.value = p
  formData.value = {
    sku: p.sku, name: p.name, categoryId: p.categoryId, supplierId: p.supplierId,
    unit: p.unit, minimumStock: p.minimumStock, description: p.description || '',
  }
  formError.value = ''
  showModal.value = true
}

async function handleSubmit() {
  const f = formData.value
  if (!f.name.trim()) { formError.value = 'Nama produk wajib diisi'; return }
  if (!f.categoryId) { formError.value = 'Kategori wajib dipilih'; return }
  if (!f.supplierId) { formError.value = 'Supplier wajib dipilih'; return }

  formLoading.value = true; formError.value = ''
  try {
    if (editingProduct.value) {
      await productsService.update(editingProduct.value.id, {
        name: f.name.trim(), categoryId: f.categoryId, supplierId: f.supplierId,
        unit: f.unit, minimumStock: f.minimumStock, description: f.description.trim() || undefined,
      })
      toast.success('Produk berhasil diperbarui')
    } else {
      if (!f.sku.trim()) { formError.value = 'SKU wajib diisi'; formLoading.value = false; return }
      await productsService.create({
        sku: f.sku.trim(), name: f.name.trim(), categoryId: f.categoryId,
        supplierId: f.supplierId, unit: f.unit, minimumStock: f.minimumStock,
        description: f.description.trim() || undefined,
      })
      toast.success('Produk berhasil dibuat')
    }
    showModal.value = false; fetchProducts()
  } catch (error: any) { formError.value = error.response?.data?.message || 'Terjadi kesalahan' }
  finally { formLoading.value = false }
}

function openDeleteDialog(p: Product) { deletingProduct.value = p; showDeleteDialog.value = true }

async function handleDelete() {
  if (!deletingProduct.value) return
  deleteLoading.value = true
  try {
    await productsService.delete(deletingProduct.value.id)
    toast.success('Produk berhasil dihapus')
    showDeleteDialog.value = false; fetchProducts()
  } catch (error: any) { toast.error(error.response?.data?.message || 'Gagal menghapus produk') }
  finally { deleteLoading.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Produk</h2>
        <p class="text-sm text-muted-foreground">Kelola produk inventaris rumah sakit</p>
      </div>
      <button v-if="authStore.isAdmin" class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm" @click="openCreateModal">
        <Plus class="h-4 w-4" :stroke-width="1.5" /> Tambah Produk
      </button>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" :stroke-width="1.5" />
      <input v-model="search" type="text" placeholder="Cari produk atau SKU..." class="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-colors" />
      <button v-if="search" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="search = ''"><X class="h-4 w-4" :stroke-width="1.5" /></button>
    </div>

    <LoadingSkeleton v-if="loading" :rows="5" :cols="6" />

    <EmptyState v-else-if="!products.length" title="Belum ada produk" description="Tambahkan produk pertama ke inventaris.">
      <button v-if="authStore.isAdmin" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" @click="openCreateModal"><Plus class="h-4 w-4" /> Tambah Produk</button>
    </EmptyState>

    <div v-else class="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
              <th class="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Nama Produk</th>
              <th class="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">Kategori</th>
              <th class="px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Stok</th>
              <th class="px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Unit</th>
              <th class="px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th class="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="p in products" :key="p.id" class="transition-colors duration-200 hover:bg-muted/30">
              <td class="px-4 py-2.5">
                <code class="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono border border-border/50">{{ p.sku }}</code>
              </td>
              <td class="px-4 py-2.5">
                <div class="font-medium text-foreground tracking-tight">{{ p.name }}</div>
                <div class="text-[11px] text-muted-foreground md:hidden mt-0.5">{{ p.category?.name }}</div>
              </td>
              <td class="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{{ p.category?.name }}</td>
              <td class="px-4 py-2.5 text-center">
                <span :class="['font-semibold tabular-nums', p.currentStock <= p.minimumStock ? 'text-destructive' : 'text-foreground']">
                  {{ p.currentStock }}
                </span>
                <span class="text-muted-foreground tabular-nums text-xs"> / {{ p.minimumStock }}</span>
              </td>
              <td class="px-4 py-2.5 text-center hidden sm:table-cell text-muted-foreground">{{ getUnitLabel(p.unit) }}</td>
              <td class="px-4 py-2.5 text-center">
                <StatusBadge :type="getStockStatus(p.currentStock, p.minimumStock)" />
              </td>
              <td class="px-4 py-2.5">
                <div class="flex items-center justify-end gap-1">
                  <button class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95" @click="router.push(`/products/${p.id}`)" title="Detail"><Eye class="h-4 w-4" :stroke-width="1.5" /></button>
                  <button v-if="authStore.isAdmin" class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95" @click="openEditModal(p)" title="Edit"><Pencil class="h-4 w-4" :stroke-width="1.5" /></button>
                  <button v-if="authStore.isAdmin" class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95" @click="openDeleteDialog(p)" title="Hapus"><Trash2 class="h-4 w-4" :stroke-width="1.5" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3"><PaginationControls :currentPage="page" :totalPages="totalPages" :total="total" @update:currentPage="page = $event" /></div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showModal = false" />
          <div class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card p-6 shadow-xl animate-fade-in">
            <button class="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground" @click="showModal = false"><X class="h-4 w-4" /></button>
            <h3 class="text-lg font-semibold">{{ editingProduct ? 'Edit Produk' : 'Tambah Produk' }}</h3>
            <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
              <div v-if="formError" class="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{{ formError }}</div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium">SKU *</label>
                  <input v-model="formData.sku" type="text" placeholder="MED-001" :disabled="!!editingProduct" :class="['flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20', editingProduct ? 'opacity-50 cursor-not-allowed' : '']" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium">Unit *</label>
                  <select v-model="formData.unit" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option v-for="u in units" :key="u.value" :value="u.value">{{ u.label }}</option>
                  </select>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Nama Produk *</label>
                <input v-model="formData.name" type="text" placeholder="Sarung Tangan Latex" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Kategori *</label>
                  <select v-model="formData.categoryId" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Pilih Kategori</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium">Supplier *</label>
                  <select v-model="formData.supplierId" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Pilih Supplier</option>
                    <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Stok Minimum</label>
                <input v-model.number="formData.minimumStock" type="number" min="0" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Deskripsi</label>
                <textarea v-model="formData.description" rows="2" placeholder="Deskripsi produk" class="flex w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" class="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent" @click="showModal = false">Batal</button>
                <button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" :disabled="formLoading">
                  <Loader2 v-if="formLoading" class="h-4 w-4 animate-spin" /> {{ editingProduct ? 'Simpan' : 'Buat' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>

    <ConfirmDialog :open="showDeleteDialog" :loading="deleteLoading" :description="`Apakah Anda yakin ingin menghapus produk '${deletingProduct?.name}' (${deletingProduct?.sku})?`" @confirm="handleDelete" @cancel="showDeleteDialog = false" />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
