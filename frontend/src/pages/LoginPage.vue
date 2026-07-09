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
    <!-- Left - Branding (Premium Aurora/Mesh Gradient) -->
    <div class="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-950 p-12 lg:flex">
      <!-- Layered Radial Gradients for Aurora effect -->
      <div class="absolute -top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-blue-600/30 blur-[100px] mix-blend-screen"></div>
      <div class="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-[80px] mix-blend-screen"></div>
      
      <!-- Content (Glassmorphic) -->
      <div class="relative z-10 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <Activity class="h-5 w-5 text-white" :stroke-width="1.5" />
        </div>
        <span class="text-xl font-semibold tracking-tight text-white">MediStock</span>
      </div>

      <div class="relative z-10 space-y-6">
        <h2 class="text-5xl font-bold tracking-tighter leading-[1.1] text-white">
          Precision inventory<br />
          at hospital scale.
        </h2>
        <p class="max-w-md text-base leading-relaxed text-zinc-300">
          Real-time tracking, intelligent stock alerts, and end-to-end medical supply chain visibility. Engineered for high-density operations.
        </p>
        <div class="flex gap-8 pt-8 border-t border-white/10 mt-8">
          <div>
            <div class="text-2xl font-semibold text-white">100%</div>
            <div class="text-xs tracking-wide uppercase mt-1 text-zinc-400">Accuracy</div>
          </div>
          <div>
            <div class="text-2xl font-semibold text-white">Zero</div>
            <div class="text-xs tracking-wide uppercase mt-1 text-zinc-400">Stockouts</div>
          </div>
        </div>
      </div>

      <p class="relative z-10 text-xs font-medium text-zinc-500">
        &copy; 2026 MediStock Inc.
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
            <label for="email" class="text-sm font-medium text-foreground">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="name@hospital.com"
              class="flex h-11 w-full rounded-md border border-input bg-background px-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
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
                placeholder="Enter password"
                class="flex h-11 w-full rounded-md border border-input bg-background px-4 pr-11 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" :stroke-width="1.5" />
                <Eye v-else class="h-4 w-4" :stroke-width="1.5" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="flex h-11 w-full items-center justify-center rounded-md bg-foreground font-medium text-background transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:opacity-50 mt-2 shadow-sm"
            :disabled="authStore.loading"
          >
            <Loader2 v-if="authStore.loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ authStore.loading ? 'Authenticating...' : 'Sign in' }}
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
