<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Menu, LogOut, Shield, Eye } from 'lucide-vue-next'

const emit = defineEmits<{
  toggleSidebar: []
  toggleMobileSidebar: []
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  return (route.meta.title as string) || 'Dashboard'
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
    <div class="flex items-center gap-3">
      <!-- Mobile hamburger -->
      <button
        class="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        @click="emit('toggleMobileSidebar')"
      >
        <Menu class="h-5 w-5" />
      </button>

      <!-- Desktop collapse toggle -->
      <button
        class="hidden rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:block"
        @click="emit('toggleSidebar')"
      >
        <Menu class="h-5 w-5" />
      </button>

      <div class="h-6 w-px bg-border hidden lg:block" />

      <h1 class="text-lg font-semibold text-foreground">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-3">
      <!-- Role badge -->
      <div
        :class="[
          'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
          authStore.isAdmin
            ? 'bg-primary/10 text-primary'
            : 'bg-blue-50 text-blue-600'
        ]"
      >
        <Shield v-if="authStore.isAdmin" class="h-3.5 w-3.5" />
        <Eye v-else class="h-3.5 w-3.5" />
        {{ authStore.isAdmin ? 'Admin' : 'Viewer' }}
      </div>

      <!-- User name -->
      <span class="hidden text-sm text-muted-foreground md:block">
        {{ authStore.userName }}
      </span>

      <!-- Logout -->
      <button
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        @click="handleLogout"
      >
        <LogOut class="h-4 w-4" />
        <span class="hidden md:inline">Keluar</span>
      </button>
    </div>
  </header>
</template>
