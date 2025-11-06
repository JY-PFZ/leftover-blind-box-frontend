<template>
  <div class="relative">
    <!-- Full-Width Hero Section -->
    <section 
      ref="heroSection"
      class="h-screen w-full relative overflow-hidden flex items-center justify-center"
    >
      <!-- Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800">
        <!-- Animated overlay pattern -->
        <div class="absolute inset-0 opacity-20">
          <div 
            v-for="i in 20" 
            :key="i"
            class="absolute w-64 h-64 rounded-full blur-3xl"
            :style="{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }"
          ></div>
        </div>
        
        <!-- Grid pattern overlay -->
        <div class="absolute inset-0 opacity-10" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <div 
          class="space-y-8"
          :class="{ 'animate-fade-in-up': isVisible }"
        >
          <!-- Main Title -->
          <h1 class="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-tight">
            <span class="block text-white">Our Story</span>
            <span class="block text-brand-100 mt-2">Begins Here</span>
          </h1>
          
          <!-- Brand Mission -->
          <p class="text-xl sm:text-2xl md:text-3xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
            We are Magic Bag — transforming food waste into wonder, 
            one surprise bag at a time. Join us in creating a sustainable future 
            where every purchase makes a difference.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <RouterLink 
              to="/" 
              class="px-8 py-4 bg-white text-brand-700 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Start Shopping
            </RouterLink>
            <button 
              @click="scrollToContent"
              class="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div 
        class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
        @click="scrollToContent"
      >
        <div class="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors">
          <span class="text-sm font-medium">Scroll Down</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>

    <!-- Content Sections (Scroll Down) -->
    <section ref="contentSection" class="relative bg-white">
      <!-- Mission Section -->
      <div 
        class="py-24 px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto transition-all duration-1000"
        :class="{ 'opacity-100 translate-y-0': missionVisible, 'opacity-0 translate-y-10': !missionVisible }"
      >
        <div class="text-center mb-16">
          <h2 class="text-5xl sm:text-6xl font-black text-ink-900 mb-6">Our Mission</h2>
          <div class="w-24 h-1 bg-brand mx-auto"></div>
        </div>
        
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <p class="text-xl text-ink-700 leading-relaxed">
              At Magic Bag, we believe that good food shouldn't go to waste. Our platform connects 
              local merchants with customers who love great deals and surprises.
            </p>
            <p class="text-lg text-ink-600 leading-relaxed">
              Every Magic Bag is a mystery box filled with quality products that merchants need 
              to sell quickly. You get incredible value, merchants reduce waste, and together we 
              make a positive impact on our planet.
            </p>
          </div>
          <div class="relative">
            <div class="aspect-square bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center text-8xl shadow-soft">
              🌱
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works Section -->
      <div 
        class="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-orange-50 to-amber-50 transition-all duration-1000"
        :class="{ 'opacity-100 translate-y-0': howItWorksVisible, 'opacity-0 translate-y-10': !howItWorksVisible }"
      >
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-5xl sm:text-6xl font-black text-ink-900 mb-6">How It Works</h2>
            <div class="w-24 h-1 bg-brand mx-auto"></div>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div 
              v-for="(step, index) in steps" 
              :key="index"
              class="bg-white rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all transform hover:-translate-y-2"
              :style="{ animationDelay: `${index * 0.2}s` }"
            >
              <div class="w-20 h-20 bg-brand rounded-full flex items-center justify-center mb-6 text-4xl">
                {{ step.icon }}
              </div>
              <h3 class="text-2xl font-bold text-ink-900 mb-4">{{ step.title }}</h3>
              <p class="text-ink-600 leading-relaxed">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline / Journey Section -->
      <div 
        class="py-24 px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto transition-all duration-1000"
        :class="{ 'opacity-100 translate-y-0': timelineVisible, 'opacity-0 translate-y-10': !timelineVisible }"
      >
        <div class="text-center mb-16">
          <h2 class="text-5xl sm:text-6xl font-black text-ink-900 mb-6">Our Journey</h2>
          <div class="w-24 h-1 bg-brand mx-auto"></div>
        </div>
        
        <div class="space-y-12">
          <div 
            v-for="(milestone, index) in milestones" 
            :key="index"
            class="flex flex-col md:flex-row gap-8 items-center"
            :class="{ 'md:flex-row-reverse': index % 2 === 1 }"
          >
            <div class="flex-1">
              <div class="text-brand font-bold text-lg mb-2">{{ milestone.year }}</div>
              <h3 class="text-3xl font-bold text-ink-900 mb-4">{{ milestone.title }}</h3>
              <p class="text-ink-600 leading-relaxed">{{ milestone.description }}</p>
            </div>
            <div class="flex-1">
              <div class="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl flex items-center justify-center text-6xl shadow-soft">
                {{ milestone.icon }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Values Section -->
      <div 
        class="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-brand-50 to-orange-50 transition-all duration-1000"
        :class="{ 'opacity-100 translate-y-0': valuesVisible, 'opacity-0 translate-y-10': !valuesVisible }"
      >
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-5xl sm:text-6xl font-black text-ink-900 mb-6">Our Values</h2>
            <div class="w-24 h-1 bg-brand mx-auto"></div>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div 
              v-for="(value, index) in values" 
              :key="index"
              class="bg-white rounded-2xl p-8 shadow-soft text-center hover:shadow-xl transition-all"
            >
              <div class="text-6xl mb-6">{{ value.icon }}</div>
              <h3 class="text-2xl font-bold text-ink-900 mb-4">{{ value.title }}</h3>
              <p class="text-ink-600 leading-relaxed">{{ value.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Final CTA Section -->
      <div 
        class="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-brand-600 to-brand-700 text-white transition-all duration-1000"
        :class="{ 'opacity-100 translate-y-0': ctaVisible, 'opacity-0 translate-y-10': !ctaVisible }"
      >
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-5xl sm:text-6xl font-black mb-6">Ready to Join Us?</h2>
          <p class="text-xl mb-8 opacity-90">
            Join thousands of customers who are making a difference while saving money!
          </p>
          <RouterLink 
            to="/" 
            class="inline-block bg-white text-brand-700 px-10 py-5 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Your Magic Bag Journey
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';

const heroSection = ref(null);
const contentSection = ref(null);
const isVisible = ref(true);
const missionVisible = ref(false);
const howItWorksVisible = ref(false);
const timelineVisible = ref(false);
const valuesVisible = ref(false);
const ctaVisible = ref(false);

const steps = [
  {
    icon: '🛍️',
    title: 'Browse & Select',
    description: 'Explore our collection of surprise bags from local merchants near you.'
  },
  {
    icon: '🎁',
    title: 'Get Your Magic Bag',
    description: 'Receive a curated selection of quality products at amazing prices.'
  },
  {
    icon: '🌱',
    title: 'Make an Impact',
    description: 'Help reduce food waste while enjoying great deals and supporting local businesses.'
  }
];

const milestones = [
  {
    year: '2024',
    title: 'The Beginning',
    icon: '🚀',
    description: 'Magic Bag was born from a simple idea: what if we could turn food waste into wonder? We started connecting local merchants with customers who love surprises.'
  },
  {
    year: '2024',
    title: 'Growing Community',
    icon: '👥',
    description: 'Thousands of customers joined our mission. Together, we\'ve saved tons of food from going to waste while creating joy and value for everyone involved.'
  },
  {
    year: '2025',
    title: 'Looking Forward',
    icon: '🌟',
    description: 'We\'re expanding to more cities, partnering with more merchants, and creating an even bigger impact. The future is bright, and it\'s sustainable!'
  }
];

const values = [
  {
    icon: '♻️',
    title: 'Sustainability',
    description: 'We\'re committed to reducing food waste and promoting sustainable consumption.'
  },
  {
    icon: '🤝',
    title: 'Community',
    description: 'We support local merchants and build stronger communities together.'
  },
  {
    icon: '✨',
    title: 'Surprise & Delight',
    description: 'Every Magic Bag brings excitement and value to your day.'
  }
];

const scrollToContent = () => {
  contentSection.value?.scrollIntoView({ behavior: 'smooth' });
};

const handleScroll = () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  
  // Trigger animations based on scroll position
  if (scrollY > windowHeight * 0.3) {
    missionVisible.value = true;
  }
  if (scrollY > windowHeight * 0.8) {
    howItWorksVisible.value = true;
  }
  if (scrollY > windowHeight * 1.5) {
    timelineVisible.value = true;
  }
  if (scrollY > windowHeight * 2.2) {
    valuesVisible.value = true;
  }
  if (scrollY > windowHeight * 2.8) {
    ctaVisible.value = true;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  // Trigger initial check
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(30px, -30px) scale(1.1);
    opacity: 0.5;
  }
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out;
}


@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ensure smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>
