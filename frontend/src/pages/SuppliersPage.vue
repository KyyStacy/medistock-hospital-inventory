<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { suppliersService } from '@/services/suppliers.service'
import { useAuthStore } from '@/stores/auth'
import type { Supplier, PaginationParams } from '@/types'
import { formatDateShort } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { Plus, Pencil, Trash2, Search, X, Loader2, Phone, Mail, MapPin } from 'lucide-vue-next'
import EmptyState from '@/components/shared/EmptyState.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import PaginationControls from '@/components/shared/PaginationControls.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const authStore = useAuthStore()
const suppliers = ref<Supplier[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const search = ref('')
const searchTimeout = ref<ReturnType<typeof setTimeout>>()

const showModal = ref(false)
const editingSupplier = ref<Supplier | null>(null)
const formName = ref('')
const formPhone = ref('')
const formEmail = ref('')
const formAddress = ref('')
const formLoading = ref(false)
const formError = ref('')

const showDeleteDialog = ref(false)
const deletingSupplier = ref<Supplier | null>(null)
const deleteLoading = ref(false)

async function fetchSuppliers() {
  loading.value = true
  try {
    const params: PaginationParams = { page: page.value, limit: 10, search: search.value || undefined }
    const res = await suppliersService.getAll(params)
    suppliers.value = res.data
    totalPages.value = res.meta.totalPages
    total.value = res.meta.total
  } catch { toast.error('Gagal memuat data supplier') }
  finally { loading.value = false }
}

watch(search, () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => { page.value = 1; fetchSuppliers() }, 300)
})
watch(page, fetchSuppliers)
onMounted(fetchSuppliers)

function openCreateModal() {
  editingSupplier.value = null
  formName.value = ''; formPhone.value = ''; formEmail.value = ''; formAddress.value = ''
  formError.value = ''
  showModal.value = true
}

function openEditModal(s: Supplier) {
  editingSupplier.value = s
  formName.value = s.name; formPhone.value = s.phone || ''; formEmail.value = s.email || ''; formAddress.value = s.address || ''
  formError.value = ''
  showModal.value = true
}

async function handleSubmit() {
  if (!formName.value.trim()) { formError.value = 'Nama supplier wajib diisi'; return }
  formLoading.value = true; formError.value = ''
  try {
    const data = {
      name: formName.value.trim(),
      phone: formPhone.value.trim() || undefined,
      email: formEmail.value.trim() || undefined,
      address: formAddress.value.trim() || undefined,
    }
    if (editingSupplier.value) {
      await suppliersService.update(editingSupplier.value.id, data)
      toast.success('Supplier berhasil diperbarui')
    } else {
      await suppliersService.create(data)
      toast.success('Supplier berhasil dibuat')
    }
    showModal.value = false; fetchSuppliers()
  } catch (error: any) { formError.value = error.response?.data?.message || 'Terjadi kesalahan' }
  finally { formLoading.value = false }
}

function openDeleteDialog(s: Supplier) { deletingSupplier.value = s; showDeleteDialog.value = true }

async function handleDelete() {
  if (!deletingSupplier.value) return
  deleteLoading.value = true
  try {
    await suppliersService.delete(deletingSupplier.value.id)
    toast.success('Supplier berhasil dihapus')
    showDeleteDialog.value = false; fetchSuppliers()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menghapus supplier')
  } finally { deleteLoading.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Supplier</h2>
        <p class="text-sm text-muted-foreground">Kelola data supplier dan pemasok</p>
      </div>
      <button v-if="authStore.isAdmin" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]" @click="openCreateModal">
        <Plus class="h-4 w-4" /> Tambah Supplier
      </button>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input v-model="search" type="text" placeholder="Cari supplier..." class="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
      <button v-if="search" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="search = ''"><X class="h-4 w-4" /></button>
    </div>

    <LoadingSkeleton v-if="loading" :rows="5" :cols="5" />

    <EmptyState v-else-if="!suppliers.length" title="Belum ada supplier" description="Tambahkan supplier pertama untuk mulai mengelola pemasok.">
      <button v-if="authStore.isAdmin" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" @click="openCreateModal"><Plus class="h-4 w-4" /> Tambah Supplier</button>
    </EmptyState>

    <div v-else class="overflow-hidden rounded-xl border border-border bg-card">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground">Nama</th>
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground">Telepon</th>
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground">Email</th>
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Alamat</th>
              <th class="px-5 py-3 text-center font-semibold text-muted-foreground">Produk</th>
              <th v-if="authStore.isAdmin" class="px-5 py-3 text-right font-semibold text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="s in suppliers" :key="s.id" class="transition-colors hover:bg-muted/20">
              <td class="px-5 py-3 font-medium text-foreground">{{ s.name }}</td>
              <td class="px-5 py-3 text-muted-foreground">{{ s.phone || '-' }}</td>
              <td class="px-5 py-3 text-muted-foreground">{{ s.email || '-' }}</td>
              <td class="px-5 py-3 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{{ s.address || '-' }}</td>
              <td class="px-5 py-3 text-center">
                <span class="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-muted px-2 text-xs font-medium">{{ s._count?.products || 0 }}</span>
              </td>
              <td v-if="authStore.isAdmin" class="px-5 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" @click="openEditModal(s)"><Pencil class="h-4 w-4" /></button>
                  <button class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" @click="openDeleteDialog(s)"><Trash2 class="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-3"><PaginationControls :currentPage="page" :totalPages="totalPages" :total="total" @update:currentPage="page = $event" /></div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showModal = false" />
          <div class="relative w-full max-w-lg rounded-xl bg-card p-6 shadow-xl animate-fade-in">
            <button class="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground" @click="showModal = false"><X class="h-4 w-4" /></button>
            <h3 class="text-lg font-semibold">{{ editingSupplier ? 'Edit Supplier' : 'Tambah Supplier' }}</h3>
            <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
              <div v-if="formError" class="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{{ formError }}</div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Nama Supplier *</label>
                <input v-model="formName" type="text" placeholder="PT Medika Utama" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Telepon</label>
                  <input v-model="formPhone" type="text" placeholder="021-5551234" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium">Email</label>
                  <input v-model="formEmail" type="email" placeholder="info@supplier.com" class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Alamat</label>
                <textarea v-model="formAddress" placeholder="Alamat lengkap supplier" rows="2" class="flex w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <button type="button" class="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent" @click="showModal = false">Batal</button>
                <button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" :disabled="formLoading">
                  <Loader2 v-if="formLoading" class="h-4 w-4 animate-spin" /> {{ editingSupplier ? 'Simpan' : 'Buat' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>

    <ConfirmDialog :open="showDeleteDialog" :loading="deleteLoading" :description="`Apakah Anda yakin ingin menghapus supplier '${deletingSupplier?.name}'?`" @confirm="handleDelete" @cancel="showDeleteDialog = false" />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
