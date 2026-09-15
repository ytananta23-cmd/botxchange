import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Bot, LineChart, Zap, Clock, ShieldCheck, Target, ChevronDown, Check, X } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '-80px' }}
    variants={fadeUp}
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0A0F] to-[#0A0A0F] pointer-events-none" />
        <div className="ambient-glow w-[500px] h-[500px] bg-purple-600/10 top-0 left-1/2 -translate-x-1/2" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
            <div className="flex text-yellow-400 text-sm">★★★★<span className="text-white/20">★</span></div>
            <span className="text-xs font-medium text-white/80">4.0 Excellent reviews</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Automate your crypto trading. <br className="hidden md:block" /> Smart and simple.
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Connect your Delta Exchange India account and launch AI-optimized trading bots in minutes. Trade crypto perpetuals 24/7 without the stress.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto">Get Started for Free</Button>
            </Link>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/60">
                 Coming soon on iOS
               </div>
               <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/60">
                 Coming soon on Android
               </div>
            </div>
          </div>

          {/* Mockup Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-4xl mx-auto mt-12 aspect-[16/9] md:aspect-[21/9]"
          >
             <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent z-10 bottom-0 h-1/2" />
             <div className="relative rounded-t-2xl border border-white/10 bg-[#15151F] shadow-2xl shadow-purple-500/10 overflow-hidden mx-4 md:mx-0">
               <div className="h-8 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
               </div>
               <div className="p-6 grid grid-cols-3 gap-6 h-[400px]">
                  <div className="col-span-2 space-y-4">
                     <div className="h-48 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                     <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                        <div className="h-24 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="h-16 rounded-xl bg-purple-500/20 border border-purple-500/30 animate-pulse" />
                     <div className="h-16 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                     <div className="h-16 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                     <div className="h-16 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                  </div>
               </div>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-white/40 mb-6 uppercase tracking-widest">Seamlessly integrated with</p>
          <div className="flex justify-center items-center opacity-60 grayscale">
            <span className="text-2xl font-bold tracking-tighter flex items-center gap-2">
              <span className="text-white">DELTA</span> <span className="text-blue-500">EXCHANGE</span> <span className="text-xs px-2 py-0.5 bg-white/10 rounded">INDIA</span>
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid 1 */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What is BotXchange?</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Your ultimate command center for automated crypto perpetuals trading.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            <Reveal delay={0}>
            <Card className="p-8 bg-[#15151F]/50 card-hover h-full">
              <Zap className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">Connect your account</h3>
              <p className="text-white/60 leading-relaxed">Securely link your Delta Exchange India API keys. We only require trading permissions, your funds always stay in your exchange wallet.</p>
            </Card>
            </Reveal>
            <Reveal delay={0.1}>
            <Card className="p-8 bg-[#15151F]/50 card-hover h-full">
              <Target className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">Advanced control</h3>
              <p className="text-white/60 leading-relaxed">Fine-tune your strategies with advanced risk management tools, trailing stops, and multi-level take profits.</p>
            </Card>
            </Reveal>
            <Reveal delay={0.2}>
            <Card className="p-8 bg-[#15151F]/50 card-hover h-full">
              <Clock className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">24/7 Automation</h3>
              <p className="text-white/60 leading-relaxed">Crypto never sleeps, neither do our bots. Execute trades automatically based on your strategy around the clock.</p>
            </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section id="how-it-works" className="py-24 bg-[#0D0D14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Automated Crypto Trading?</h2>
              <p className="text-white/60 mb-10 text-lg">Remove emotion from the equation and let algorithms execute your plan with precision.</p>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-semibold mb-2">24/7 Trading</h4>
                  <p className="text-sm text-white/60">Never miss a market move while you sleep or work.</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Emotion-free</h4>
                  <p className="text-sm text-white/60">Stick strictly to your strategy without panic selling or FOMO.</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-semibold mb-2">AI Presets</h4>
                  <p className="text-sm text-white/60">Start instantly with AI-optimized backtested strategy templates.</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <LineChart className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Time Efficiency</h4>
                  <p className="text-sm text-white/60">Spend less time staring at charts and more time enjoying life.</p>
                </div>
              </div>
            </div>
            </Reveal>
            <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl rounded-full" />
              <Card className="relative p-6 border-white/10 bg-black/50 backdrop-blur-xl card-hover">
                 <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <div>
                          <div className="text-sm text-white/60">Total Bot Profit</div>
                          <div className="text-3xl font-bold text-green-400">+$2,450.50</div>
                       </div>
                       <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">+15.4%</div>
                    </div>
                    <div className="space-y-3">
                       {[1,2,3].map(i => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">BTC</div>
                               <div>
                                  <div className="text-sm font-medium">Grid Scalper {i}</div>
                                  <div className="text-xs text-white/40">Active</div>
                               </div>
                            </div>
                            <div className="text-right text-sm text-green-400 font-medium">+$45.20</div>
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
           <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Manual vs Automated</h2>
            <p className="text-white/60">See why top traders are switching to automation.</p>
          </Reveal>

          <Reveal delay={0.1}>
          <Card className="overflow-hidden border-white/10 bg-[#15151F]">
            <div className="grid grid-cols-3 bg-black/40 p-4 border-b border-white/5 font-semibold text-sm">
               <div className="text-white/60">Feature</div>
               <div className="text-center text-white/60">Manual Trading</div>
               <div className="text-center text-purple-400">BotXchange</div>
            </div>
            {[
              { label: 'Trading Hours', manual: 'Limited to screen time', auto: '24/7/365' },
              { label: 'Emotion Control', manual: 'Prone to panic/greed', auto: '100% disciplined' },
              { label: 'Execution Speed', manual: 'Seconds to minutes', auto: 'Milliseconds' },
              { label: 'Strategy Testing', manual: 'Hard to track accurately', auto: 'Built-in analytics' },
              { label: 'Multi-pair Trading', manual: '1-3 pairs max', auto: 'Unlimited pairs simultaneously' },
            ].map((row, i) => (
               <div key={i} className="grid grid-cols-3 p-4 border-b border-white/5 text-sm items-center hover:bg-white/[0.02]">
                  <div className="font-medium">{row.label}</div>
                  <div className="text-center text-white/40 flex flex-col items-center gap-1">
                     <X className="w-4 h-4 text-red-500" />
                     <span className="text-xs">{row.manual}</span>
                  </div>
                  <div className="text-center text-white flex flex-col items-center gap-1">
                     <Check className="w-4 h-4 text-green-500" />
                     <span className="text-xs">{row.auto}</span>
                  </div>
               </div>
            ))}
          </Card>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-[#0D0D14]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </Reveal>
          <div className="space-y-4">
             {[
                {
                   q: 'Is my money safe?',
                   a: 'Yes. BotXchange never holds your funds. Your capital stays in your Delta Exchange India account. You only provide us with API keys that have "Trading" permissions enabled, and "Withdrawal" permissions explicitly disabled.'
                },
                {
                   q: 'Do I need trading experience?',
                   a: 'No prior experience is necessary. Our AI Presets allow you to start bots with pre-configured, optimized settings. However, understanding basic market dynamics is recommended.'
                },
                {
                   q: 'Which exchange is supported?',
                   a: 'Currently, we exclusively support Delta Exchange India for trading crypto perpetual derivatives.'
                },
                {
                   q: 'Can I paper-trade first?',
                   a: 'Absolutely. We offer a fully-featured Demo Account where you can test strategies with simulated funds before risking real capital.'
                }
             ].map((faq, i) => (
                <Card key={i} className="bg-[#15151F] border-white/10">
                   <details className="group">
                      <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-lg">
                         <span>{faq.q}</span>
                         <span className="transition group-open:rotate-180">
                            <ChevronDown className="w-5 h-5 text-white/40" />
                         </span>
                      </summary>
                      <div className="text-white/60 mt-2 px-6 pb-6 leading-relaxed">
                         {faq.a}
                      </div>
                   </details>
                </Card>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-[#0A0A0F]" />
        <Reveal className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to automate your crypto trading?</h2>
          <p className="text-xl text-white/60 mb-10">Join traders automating their strategies on Delta Exchange India.</p>
          <Link to="/signup">
             <Button variant="gradient" size="lg" className="px-12">Open Free Account</Button>
          </Link>
        </Reveal>
      </section>
    </div>
  );
};
