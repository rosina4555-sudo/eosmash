<script setup lang="ts">
import { useReveal, useRevealGroup } from '../../composables/useReveal'
import FAQAccordion from '../ui/FAQAccordion.vue'

const { setRef: headerRef, isVisible: headerVisible, style: headerStyle } = useReveal()
const { setRef: listRef, visible: listVisible, itemStyle } = useRevealGroup(7, 50)

const faqs = [
  {
    question: 'What is Eosmash?',
    answer:
      'Eosmash is a competitive gaming platform where players go head to head in skill-based games and organized competitions.',
  },
  {
    question: 'How will Eosmash work?',
    answer:
      'You pick a supported game, get matched with an opponent, play under clear rules and the result decides who wins.',
  },
  {
    question: 'Will players compete for real money?',
    answer:
      'We plan to offer competitions with entry stakes and cash prizes where the law allows it. Availability will depend on your location, eligibility and which games are live.',
  },
  {
    question: 'Which games will be available?',
    answer:
      'We are looking at fighting, racing, strategy and arcade titles. Final launch games will be announced as we get closer to release.',
  },
  {
    question: 'Is Eosmash available now?',
    answer:
      'Not yet. We are still building. Join the waitlist and you will get updates and early access info when the time comes.',
  },
  {
    question: 'Who can join?',
    answer:
      'Anyone who wants to follow along can join the waitlist. Taking part in paid competitions later will depend on age, location and eligibility rules.',
  },
  {
    question: 'Does joining the waitlist cost anything?',
    answer: 'Nope. Signing up is completely free.',
  },
]
</script>

<template>
  <section id="faq" class="scroll-mt-20 py-20 md:py-28 lg:py-32" aria-labelledby="faq-heading">
    <div class="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-16">
      <div
        :ref="headerRef"
        class="mb-10 max-w-2xl reveal md:mb-14"
        :class="{ 'is-visible': headerVisible }"
        :style="headerStyle"
      >
        <h2
          id="faq-heading"
          class="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-pure-white md:text-[42px] lg:text-[48px]"
        >
          Eosmash questions.
        </h2>
      </div>

      <div :ref="listRef" class="max-w-3xl">
        <div class="space-y-3">
          <div
            v-for="(item, index) in faqs"
            :key="item.question"
            class="reveal rounded-[14px] bg-deep-navy"
            :class="{ 'is-visible': listVisible }"
            :style="itemStyle(index)"
          >
            <FAQAccordion
              :item="item"
              :is-open="false"
              :index="index"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
