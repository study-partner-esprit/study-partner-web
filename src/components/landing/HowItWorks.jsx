import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import TiltCard from '@/components/ui/TiltCard';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Course',
    description: 'Import your course materials and let AI analyze the content structure.',
  },
  {
    icon: Calendar,
    title: 'Generate Study Plan',
    description: 'Receive a personalized study schedule optimized for your goals and availability.',
  },
  {
    icon: BookOpen,
    title: 'Study with AI Coach',
    description: 'Engage in focused sessions with real-time guidance and adaptive support.',
  },
  {
    icon: TrendingUp,
    title: 'Improve with Feedback',
    description: 'Track progress and refine your learning strategy based on performance data.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-4xl md:text-6xl font-bold text-center mb-16 text-gray-900 dark:text-white font-valorant uppercase tracking-tighter"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          How It <span className="text-outline">Works</span>
        </motion.h2>
        <div className="relative">
          {/* Timeline line - Tech style */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-primary/30"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex items-start mb-16 relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              {/* Timeline Node - Diamond shape */}
              <div className="absolute left-8 top-8 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rotate-45 z-10 shadow-[0_0_15px_rgba(var(--primary),0.5)] flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-primary" />
              </div>
              
              <TiltCard className="w-full card-valorant">
               <div className="ml-16 md:ml-20 p-6 md:p-8 relative w-full">
                  {/* Glossy sheen overlay */}
                 <div className="card-inner-sheen" />
                 
                <div className="flex items-center gap-4 mb-4 relative z-10 border-b border-primary/10 pb-4">
                  <div className="p-3 bg-primary/5 border border-primary/20 relative" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%, 0 80%)' }}>
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-valorant uppercase tracking-wide howitworks-title">
                    // {step.title}
                  </h3>
                </div>
                <p className="text-muted leading-relaxed text-lg relative z-10 font-medium">
                  {step.description}
                </p>
              </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
