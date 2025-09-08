import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { DailyBalance } from '../../types';
import { TimelinePoint } from './TimelinePoint';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineProps {
  dailyBalances: DailyBalance[];
  onPointSelect: (dailyBalance: DailyBalance) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ dailyBalances, onPointSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const handlePointClick = (dailyBalance: DailyBalance, index: number) => {
    setActiveIndex(index);
    onPointSelect(dailyBalance);
    
    // Scroll to center the selected point
    if (scrollRef.current) {
      const element = scrollRef.current;
      const pointWidth = 200 + 32; // min-width + margins
      const scrollLeft = index * pointWidth - element.clientWidth / 2;
      element.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-inner">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Timeline Financeira</h2>
        
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all hover:bg-gray-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all hover:bg-gray-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="relative">
        {/* Main Timeline Line */}
        <div className="absolute top-1/2 left-0 w-full h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full transform -translate-y-1/2 shadow-inner" />
        
        {/* Timeline Line Glow Effect */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 rounded-full transform -translate-y-1/2 blur-sm" />
        
        {/* Scrollable Timeline Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto custom-scrollbar py-12"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dailyBalances.length > 0 ? (
            dailyBalances.map((dailyBalance, index) => (
              <TimelinePoint
                key={dailyBalance.date}
                dailyBalance={dailyBalance}
                index={index}
                isAlternate={index % 2 === 1}
                isActive={index === activeIndex}
                onClick={() => handlePointClick(dailyBalance, index)}
              />
            ))
          ) : (
            <div className="flex items-center justify-center w-full py-12">
              <div className="text-center">
                <div className="text-6xl mb-6">📅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhuma transação neste mês
                </h3>
                <p className="text-gray-500">
                  Adicione transações para visualizar sua timeline financeira
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Parallax Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-8 right-16 w-40 h-40 bg-gradient-to-br from-blue-300/15 to-purple-300/15 rounded-full blur-3xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-8 left-16 w-32 h-32 bg-gradient-to-br from-green-300/15 to-teal-300/15 rounded-full blur-2xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 25, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 w-20 h-20 bg-gradient-to-br from-yellow-300/10 to-orange-300/10 rounded-full blur-xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
};