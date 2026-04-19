"use client"

import { motion } from 'framer-motion'
import ThemeTogglerTwo from '../common/ThemeTogglerTwo'
import { Terminal } from 'lucide-react'

export default function SystemControl() {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.6 
            }}
            className='fixed right-6 top-6 z-[60]'
        >
            {/* Glassmorphic Container 
                Uses a flex layout to align the label and the toggle perfectly.
            */}
            <div className='flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/70 dark:bg-[#121214]/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group'>
               
                {/* System Label: Styled as a terminal tag */}
                <div className='flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-800'>
                    <Terminal className='h-3 w-3 text-slate-400 group-hover:text-blue-500 transition-colors' />
                    <span className='font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 select-none'>
                        Mode
                    </span>
                </div>

                {/* The Component payload */}
                <div className='scale-90 origin-center'>
                    <ThemeTogglerTwo />
                </div>
            </div>
        </motion.div>
    )
}