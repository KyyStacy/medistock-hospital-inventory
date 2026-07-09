<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  X,
  Activity,
} from 'lucide-vue-next'

const props = defineProps<{
  collapsed: boolean
  mobileOpen: boolean
}>()

const emit = defineEmits<{
  closeMobile: []
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface NavItem {
  label: string
  icon: any
  to: string
  adminOnly?: boolean
}

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Produk', icon: Package, to: '/products' },
    { label: 'Kategori', icon: Tags, to: '/categories' },
    { label: 'Supplier', icon: Truck, to: '/suppliers' },
  ]

  if (authStore.isAdmin) {
    items.push(
      { label: 'Stok Masuk', icon: ArrowDownToLine, to: '/stock-in', adminOnly: true },
      { label: 'Stok Keluar', icon: ArrowUpFromLine, to: '/stock-out', adminOnly: true },
    )
  }

  items.push({ label: 'Riwayat Stok', icon: History, to: '/stock-history' })

  return items
})

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}

function navigate(path: string) {
  router.push(path)
  emit('closeMobile')
}
</script>

<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] bg-sidebar text-sidebar-foreground transition-all duration-300 lg:relative lg:z-auto',
      collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
      mobileOpen ? 'w-[260px] translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Logo -->
    <div class="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
        <Activity class="h-5 w-5 text-white" />
      </div>
      <div v-if="!collapsed" class="flex flex-col overflow-hidden">
        <span class="truncate text-sm font-bold tracking-tight text-white">MediStock</span>
        <span class="truncate text-[10px] text-sidebar-foreground/50">Inventory Management</span>
      </div>
      <button
        class="ml-auto rounded-md p-1 text-sidebar-foreground/50 hover:text-white lg:hidden"
        @click="emit('closeMobile')"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <button
        v-for="item in navItems"
        :key="item.to"
        :class="[
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
          isActive(item.to)
            ? 'bg-sidebar-accent text-white'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white'
        ]"
        @click="navigate(item.to)"
      >
        <component
          :is="item.icon"
          :class="[
            'h-[18px] w-[18px] shrink-0 transition-colors',
            isActive(item.to) ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
          ]"
        />
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </button>
    </nav>

    <!-- User info -->
    <div class="border-t border-white/[0.06] p-3">
      <div
        :class="[
          'flex items-center gap-3 rounded-lg px-3 py-2',
          collapsed ? 'justify-center' : ''
        ]"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
          {{ authStore.userName?.charAt(0)?.toUpperCase() }}
        </div>
        <div v-if="!collapsed" class="flex flex-col overflow-hidden">
          <span class="truncate text-xs font-medium text-white">{{ authStore.userName }}</span>
          <span class="truncate text-[10px] text-sidebar-foreground/50">{{ authStore.userRole }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>
