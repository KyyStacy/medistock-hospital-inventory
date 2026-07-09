<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { categoriesService } from '@/services/categories.service'
import { useAuthStore } from '@/stores/auth'
import type { Category, PaginationParams } from '@/types'
import { formatDateShort } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { Plus, Pencil, Trash2, Search, X, Loader2 } from 'lucide-vue-next'
import EmptyState from '@/components/shared/EmptyState.vue'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton.vue'
import PaginationControls from '@/components/shared/PaginationControls.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const authStore = useAuthStore()

// State
const categories = ref<Category[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const search = ref('')
const searchTimeout = ref<ReturnType<typeof setTimeout>>()

// Modal state
const showModal = ref(false)
const editingCategory = ref<Category | null>(null)
const formName = ref('')
const formDescription = ref('')
const formLoading = ref(false)
const formError = ref('')

// Delete state
const showDeleteDialog = ref(false)
const deletingCategory = ref<Category | null>(null)
const deleteLoading = ref(false)

async function fetchCategories() {
  loading.value = true
  try {
    const params: PaginationParams = {
      page: page.value,
      limit: 10,
      search: search.value || undefined,
    }
    const res = await categoriesService.getAll(params)
    categories.value = res.data
    totalPages.value = res.meta.totalPages
    total.value = res.meta.total
  } catch (error) {
    toast.error('Gagal memuat data kategori')
  } finally {
    loading.value = false
  }
}

watch(search, () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    page.value = 1
    fetchCategories()
  }, 300)
})

watch(page, fetchCategories)

onMounted(fetchCategories)

function openCreateModal() {
  editingCategory.value = null
  formName.value = ''
  formDescription.value = ''
  formError.value = ''
  showModal.value = true
}

function openEditModal(category: Category) {
  editingCategory.value = category
  formName.value = category.name
  formDescription.value = category.description || ''
  formError.value = ''
  showModal.value = true
}

async function handleSubmit() {
  if (!formName.value.trim()) {
    formError.value = 'Nama kategori wajib diisi'
    return
  }

  formLoading.value = true
  formError.value = ''

  try {
    if (editingCategory.value) {
      await categoriesService.update(editingCategory.value.id, {
        name: formName.value.trim(),
        description: formDescription.value.trim() || undefined,
      })
      toast.success('Kategori berhasil diperbarui')
    } else {
      await categoriesService.create({
        name: formName.value.trim(),
        description: formDescription.value.trim() || undefined,
      })
      toast.success('Kategori berhasil dibuat')
    }
    showModal.value = false
    fetchCategories()
  } catch (error: any) {
    formError.value = error.response?.data?.message || 'Terjadi kesalahan'
  } finally {
    formLoading.value = false
  }
}

function openDeleteDialog(category: Category) {
  deletingCategory.value = category
  showDeleteDialog.value = true
}

async function handleDelete() {
  if (!deletingCategory.value) return
  deleteLoading.value = true
  try {
    await categoriesService.delete(deletingCategory.value.id)
    toast.success('Kategori berhasil dihapus')
    showDeleteDialog.value = false
    fetchCategories()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal menghapus kategori'
    toast.error(typeof msg === 'string' ? msg : msg[0])
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-foreground">Kategori</h2>
        <p class="text-sm text-muted-foreground">Kelola kategori produk inventaris</p>
      </div>
      <button
        v-if="authStore.isAdmin"
        class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Tambah Kategori
      </button>
    </div>

    <!-- Search -->
    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        v-model="search"
        type="text"
        placeholder="Cari kategori..."
        class="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        v-if="search"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        @click="search = ''"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Loading -->
    <LoadingSkeleton v-if="loading" :rows="5" :cols="4" />

    <!-- Empty -->
    <EmptyState
      v-else-if="!categories.length"
      title="Belum ada kategori"
      description="Buat kategori pertama untuk mulai mengelompokkan produk."
    >
      <button
        v-if="authStore.isAdmin"
        class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Tambah Kategori
      </button>
    </EmptyState>

    <!-- Table -->
    <div v-else class="overflow-hidden rounded-xl border border-border bg-card">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground">Nama</th>
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground">Deskripsi</th>
              <th class="px-5 py-3 text-center font-semibold text-muted-foreground">Produk</th>
              <th class="px-5 py-3 text-left font-semibold text-muted-foreground">Dibuat</th>
              <th v-if="authStore.isAdmin" class="px-5 py-3 text-right font-semibold text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="category in categories"
              :key="category.id"
              class="transition-colors hover:bg-muted/20"
            >
              <td class="px-5 py-3 font-medium text-foreground">{{ category.name }}</td>
              <td class="px-5 py-3 text-muted-foreground">{{ category.description || '-' }}</td>
              <td class="px-5 py-3 text-center">
                <span class="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-muted px-2 text-xs font-medium">
                  {{ category._count?.products || 0 }}
                </span>
              </td>
              <td class="px-5 py-3 text-muted-foreground">{{ formatDateShort(category.createdAt) }}</td>
              <td v-if="authStore.isAdmin" class="px-5 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    @click="openEditModal(category)"
                    title="Edit"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    @click="openDeleteDialog(category)"
                    title="Hapus"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-5 py-3">
        <PaginationControls
          :currentPage="page"
          :totalPages="totalPages"
          :total="total"
          @update:currentPage="page = $event"
        />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showModal = false" />
          <div class="relative w-full max-w-md rounded-xl bg-card p-6 shadow-xl animate-fade-in">
            <button
              class="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground"
              @click="showModal = false"
            >
              <X class="h-4 w-4" />
            </button>

            <h3 class="text-lg font-semibold text-foreground">
              {{ editingCategory ? 'Edit Kategori' : 'Tambah Kategori' }}
            </h3>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ editingCategory ? 'Perbarui informasi kategori' : 'Buat kategori baru untuk produk' }}
            </p>

            <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
              <div
                v-if="formError"
                class="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {{ formError }}
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Nama Kategori *</label>
                <input
                  v-model="formName"
                  type="text"
                  placeholder="Contoh: Alat Kesehatan"
                  class="flex h-10 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">Deskripsi</label>
                <textarea
                  v-model="formDescription"
                  placeholder="Deskripsi singkat kategori"
                  rows="3"
                  class="flex w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  class="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  @click="showModal = false"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                  :disabled="formLoading"
                >
                  <Loader2 v-if="formLoading" class="h-4 w-4 animate-spin" />
                  {{ editingCategory ? 'Simpan' : 'Buat' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Delete Dialog -->
    <ConfirmDialog
      :open="showDeleteDialog"
      :loading="deleteLoading"
      :description="`Apakah Anda yakin ingin menghapus kategori '${deletingCategory?.name}'? Tindakan ini tidak dapat dibatalkan.`"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
