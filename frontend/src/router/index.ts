import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/pages/DashboardPage.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/pages/CategoriesPage.vue'),
          meta: { title: 'Kategori' },
        },
        {
          path: 'suppliers',
          name: 'suppliers',
          component: () => import('@/pages/SuppliersPage.vue'),
          meta: { title: 'Supplier' },
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/pages/ProductsPage.vue'),
          meta: { title: 'Produk' },
        },
        {
          path: 'products/:id',
          name: 'product-detail',
          component: () => import('@/pages/ProductDetailPage.vue'),
          meta: { title: 'Detail Produk' },
        },
        {
          path: 'stock-in',
          name: 'stock-in',
          component: () => import('@/pages/StockInPage.vue'),
          meta: { title: 'Stok Masuk', requiresAdmin: true },
        },
        {
          path: 'stock-out',
          name: 'stock-out',
          component: () => import('@/pages/StockOutPage.vue'),
          meta: { title: 'Stok Keluar', requiresAdmin: true },
        },
        {
          path: 'stock-history',
          name: 'stock-history',
          component: () => import('@/pages/StockHistoryPage.vue'),
          meta: { title: 'Riwayat Stok' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // If requires auth
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      return next('/login')
    }

    // Load profile if not loaded
    if (!authStore.user) {
      await authStore.fetchProfile()
      if (!authStore.isAuthenticated) {
        return next('/login')
      }
    }

    // Check admin access
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      return next('/dashboard')
    }
  }

  // If already logged in and going to login
  if (to.name === 'login' && authStore.isAuthenticated) {
    return next('/dashboard')
  }

  next()
})

export default router
