import React from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import AgentsSection from '../components/landing/AgentsSection';
import CTASection from '../components/landing/CTASection';

const Landing = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <AnimatedBackground />
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <AgentsSection />
        <CTASection />
      </div>
    </div>
  );
};

export default Landing;
