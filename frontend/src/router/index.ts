import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

const router = createRouter({
  history: import.meta.env.VITE_HASH_ROUTER === 'true' ? createWebHashHistory() : createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/calendar',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/s/:shareToken',
      name: 'PublicSchedule',
      component: () => import('@/views/PublicScheduleView.vue'),
      meta: { public: true },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('@/views/CalendarView.vue'),
      meta: { showTabbar: true },
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import('@/views/OrdersView.vue'),
      meta: { showTabbar: true },
    },
    {
      path: '/orders/new',
      name: 'OrderNew',
      component: () => import('@/views/OrderFormView.vue'),
    },
    {
      path: '/orders/:id',
      name: 'OrderDetail',
      component: () => import('@/views/OrderDetailView.vue'),
    },
    {
      path: '/orders/:id/edit',
      name: 'OrderEdit',
      component: () => import('@/views/OrderFormView.vue'),
    },
    {
      path: '/finance',
      name: 'Finance',
      component: () => import('@/views/FinanceView.vue'),
      meta: { showTabbar: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { showTabbar: true },
    },
    {
      path: '/profile/packages',
      name: 'Packages',
      component: () => import('@/views/PackagesView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const token = localStorage.getItem('ms_access_token');
  if (!to.meta.public && !token) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.path === '/login' && token) {
    return { path: '/calendar' };
  }
  return true;
});

export default router;
