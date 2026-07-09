<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'

defineProps<{
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="emit('cancel')"
        />

        <!-- Dialog -->
        <div class="relative w-full max-w-md rounded-xl bg-card p-6 shadow-xl animate-fade-in">
          <button
            class="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground"
            @click="emit('cancel')"
          >
            <X class="h-4 w-4" />
          </button>

          <div class="flex gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle class="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-foreground">
                {{ title || 'Konfirmasi Hapus' }}
              </h3>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ description || 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' }}
              </p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              @click="emit('cancel')"
              :disabled="loading"
            >
              Batal
            </button>
            <button
              class="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
              @click="emit('confirm')"
              :disabled="loading"
            >
              {{ loading ? 'Menghapus...' : (confirmLabel || 'Hapus') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
