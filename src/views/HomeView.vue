<script setup lang="ts">
import Footer from '../components/layout/Footer.vue'
import Navbar from '../components/layout/Navbar.vue'
import FAQSection from '../components/sections/FAQSection.vue'
import FinalCTA from '../components/sections/FinalCTA.vue'
import GameCategories from '../components/sections/GameCategories.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import HowItWorks from '../components/sections/HowItWorks.vue'
import WaitlistSection from '../components/sections/WaitlistSection.vue'
import WhyEosmash from '../components/sections/WhyEosmash.vue'
</script>

<template>
  <div class="min-h-screen bg-midnight">
    <Navbar />
    <main>
      <HeroSection />
      <HowItWorks />
      <GameCategories />
      <WhyEosmash />
      <WaitlistSection />
      <FAQSection />
      <FinalCTA />
    </main>
    <Footer />
  </div>
</template>
