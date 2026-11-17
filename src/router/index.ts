import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Eosmash | Competitive Gaming Is Coming',
      },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PlaceholderView,
      meta: {
        title: 'Privacy Policy | Eosmash',
        placeholder: {
          eyebrow: 'Legal',
          heading: 'Privacy Policy',
          description:
            "We're putting the finishing touches on this page. It will be published here before we start onboarding players from the waitlist.",
          note: 'In short: we collect anonymous traffic stats through Umami and, only if you accept, session recordings through Microsoft Clarity. Your waitlist details are only used to send you launch and product updates.',
        },
      },
    },
    {
      path: '/terms',
      name: 'terms',
      component: PlaceholderView,
      meta: {
        title: 'Terms of Service | Eosmash',
        placeholder: {
          eyebrow: 'Legal',
          heading: 'Terms of Service',
          description:
            'This document is being finalised and will be live here before any competition with prizes goes live.',
          note: 'Any future competitions with monetary stakes or prizes will follow local laws, platform eligibility rules and our terms of service.',
        },
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: PlaceholderView,
      meta: {
        title: 'Page not found | Eosmash',
        placeholder: {
          eyebrow: '404',
          heading: 'Page not found',
          description:
            "The page you're looking for doesn't exist or hasn't been published yet.",
        },
      },
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80,
      }
    }

    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'Eosmash | Competitive Gaming Is Coming'
})

export default router
