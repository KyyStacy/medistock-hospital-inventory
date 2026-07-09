<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Email dan password wajib diisi'
    return
  }

  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left - Branding -->
    <div class="hidden w-1/2 flex-col justify-between bg-sidebar p-12 lg:flex">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Activity class="h-6 w-6 text-white" />
        </div>
        <span class="text-xl font-bold text-white">MediStock</span>
      </div>

      <div class="space-y-6">
        <h2 class="text-4xl font-bold leading-tight tracking-tight text-white">
          Sistem Manajemen<br />
          Inventaris Rumah Sakit
        </h2>
        <p class="max-w-md text-base leading-relaxed text-sidebar-foreground/60">
          Kelola inventaris rumah sakit Anda dengan mudah. Pantau stok, lacak pergerakan barang, dan dapatkan peringatan stok rendah secara real-time.
        </p>
        <div class="flex gap-8 pt-4">
          <div>
            <div class="text-2xl font-bold text-primary">100%</div>
            <div class="text-xs text-sidebar-foreground/50">Akurasi Stok</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-primary">Real-time</div>
            <div class="text-xs text-sidebar-foreground/50">Pemantauan</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-primary">Multi-role</div>
            <div class="text-xs text-sidebar-foreground/50">Akses Kontrol</div>
          </div>
        </div>
      </div>

      <p class="text-xs text-sidebar-foreground/30">
        &copy; 2026 MediStock. Hospital Inventory Management System.
      </p>
    </div>

    <!-- Right - Login Form -->
    <div class="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
      <div class="w-full max-w-[400px] space-y-8">
        <!-- Mobile logo -->
        <div class="flex items-center gap-3 lg:hidden">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Activity class="h-6 w-6 text-white" />
          </div>
          <span class="text-xl font-bold">MediStock</span>
        </div>

        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">Masuk ke akun Anda</h1>
          <p class="mt-2 text-sm text-muted-foreground">
            Masukkan email dan password untuk melanjutkan
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Error -->
          <div
            v-if="error"
            class="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {{ error }}
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-foreground">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="nama@rumahsakit.com"
              class="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              autocomplete="email"
            />
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-foreground">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                class="flex h-11 w-full rounded-lg border border-input bg-background px-4 pr-11 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="flex h-11 w-full items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            :disabled="authStore.loading"
          >
            <Loader2 v-if="authStore.loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ authStore.loading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <!-- Demo accounts -->
        <div class="rounded-lg border border-border bg-muted/30 p-4">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Akun Demo</p>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Admin:</span>
              <code class="rounded bg-muted px-2 py-0.5 text-xs">admin@example.com / password</code>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Viewer:</span>
              <code class="rounded bg-muted px-2 py-0.5 text-xs">viewer@example.com / password</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
