import { motion } from 'framer-motion';
import { FileText, Brain, Zap, Upload, MessageSquare, Shield, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  }),
};

export function Landing() {
  return (
    <div className="bg-white">
      {/* ─── HERO ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
                <span className="w-2 h-2 bg-[#2E7D32] rounded-full animate-pulse" />
                AI-Powered RAG Platform
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold font-heading leading-[1.05] text-gray-900 mb-6"
            >
              Chat with{' '}
              <span className="font-serif italic font-normal text-[#2E7D32]">your</span>
              <br />
              Documents.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-500 text-sm sm:text-base md:text-lg leading-relaxed mb-10 max-w-lg"
            >
              Upload your PDFs and documents, build{' '}
              <span className="font-serif italic text-gray-700">structural AI indexes</span>{' '}
              instantly, and query your data with{' '}
              <span className="font-serif italic text-gray-700">zero setup friction</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3.5 mb-12"
            >
              <Link to="/auth?mode=signup">
                <button className="bg-[#2E7D32] text-white font-semibold px-5 py-3 sm:px-7 sm:py-3.5 rounded-full hover:bg-[#1B5E20] transition-all hover:shadow-xl hover:shadow-green-100 flex items-center gap-2 text-sm sm:text-[15px]">
                  Get Started Free →
                </button>
              </Link>
              <Link to="/auth?mode=login">
                <button className="bg-white text-gray-700 font-semibold px-5 py-3 sm:px-7 sm:py-3.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm sm:text-[15px]">
                  Sign In
                </button>
              </Link>
            </motion.div>

            {/* Social / Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center gap-3.5 text-gray-300"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 whitespace-nowrap">Built with</span>
              <span className="hidden sm:block w-4 h-px bg-gray-200" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-gray-50/80 rounded-full border border-gray-100 text-[12px] font-semibold text-gray-600 whitespace-nowrap transition-colors hover:bg-gray-100">
                  Gemini AI
                </span>
                <span className="px-3 py-1 bg-gray-50/80 rounded-full border border-gray-100 text-[12px] font-semibold text-gray-600 whitespace-nowrap transition-colors hover:bg-gray-100">
                  pgvector
                </span>
                <span className="px-3 py-1 bg-gray-50/80 rounded-full border border-gray-100 text-[12px] font-semibold text-gray-600 whitespace-nowrap transition-colors hover:bg-gray-100">
                  Spring Boot
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Illustration Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main illustration card */}
              <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-3xl p-12 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#A5D6A7]/40 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#81C784]/30 rounded-full" />

                <div className="relative z-10 space-y-5">
                  {/* Mock chat */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">U</div>
                      <span className="text-sm font-semibold text-gray-800">You</span>
                    </div>
                    <p className="text-sm text-gray-600">What are the key findings in chapter 3?</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#2E7D32]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-xs font-bold text-[#2E7D32]">AI</div>
                      <span className="text-sm font-semibold text-gray-800">RAG Book</span>
                    </div>
                    <p className="text-sm text-gray-600">Based on your uploaded document, chapter 3 discusses three key findings...</p>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 bg-white rounded-xl px-4 py-2.5 shadow-lg border border-gray-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-xs font-bold text-gray-700">Secure & Private</span>
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white rounded-xl px-4 py-2.5 shadow-lg border border-gray-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-xs font-bold text-gray-700">Instant Answers</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col items-center mt-16 md:mt-24"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-2">Scroll</span>
          <ChevronDown className="w-5 h-5 text-gray-300 animate-bounce" />
        </motion.div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="bg-gray-50 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <motion.span
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#2E7D32] mb-4 block"
            >
              Features
            </motion.span>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.1}
              className="text-4xl md:text-5xl font-extrabold font-heading text-gray-900"
            >
              What <span className="font-serif italic font-normal text-[#2E7D32]">I</span> Offer
            </motion.h2>
            <div className="w-12 h-1 bg-[#2E7D32] rounded-full mx-auto mt-6" />
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: Upload, title: 'Instant Uploads', desc: 'Simply drop your PDF, TXT, or DOCX files. Our Apache Tika parser instantly extracts clean, structured text.', color: '#2E7D32' },
              { icon: Brain, title: 'Vector Embeddings', desc: 'Your documents are chunked and embedded using Gemini\'s state-of-the-art models into a pgvector database.', color: '#8E24AA' },
              { icon: MessageSquare, title: 'Interactive Chat', desc: 'Query your knowledge base conversationally. The AI remembers your chat history and retrieves accurate answers.', color: '#E53935' },
              { icon: Shield, title: 'Secure Storage', desc: 'Your documents are stored securely in Supabase PostgreSQL with full encryption and access controls.', color: '#3949AB' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Vector similarity search delivers relevant document chunks in milliseconds for real-time AI responses.', color: '#FB8C00' },
              { icon: FileText, title: 'Multi-Format Support', desc: 'Support for PDF, DOCX, TXT, and more. Upload any document format and start querying instantly.', color: '#43A047' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
                className="bg-white rounded-[24px] p-8 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100/80 group"
              >
                <div
                  className="w-14 h-14 animate-blob flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15`, animationDelay: `${i * -0.5}s` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color, strokeWidth: 1.5 }} />
                </div>
                <h3 className="text-[17px] font-extrabold font-heading text-gray-900 mb-2.5 tracking-tight">{feature.title}</h3>
                <p className="text-[14px] text-[#667085] leading-[1.7]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-20">
            <motion.span
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#2E7D32] mb-4 block"
            >
              How It Works
            </motion.span>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.1}
              className="text-4xl md:text-5xl font-extrabold font-heading text-gray-900"
            >
              Three <span className="font-serif italic font-normal text-[#2E7D32]">Simple</span> Steps
            </motion.h2>
            <div className="w-12 h-1 bg-[#2E7D32] rounded-full mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Upload', desc: 'Drop your documents into our secure platform. We support PDF, DOCX, TXT and more.', icon: Upload },
              { step: '02', title: 'Index', desc: 'Our AI automatically parses, chunks, and creates vector embeddings of your content.', icon: Brain },
              { step: '03', title: 'Chat', desc: 'Ask questions in natural language and get instant, accurate answers from your documents.', icon: MessageSquare },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className="text-center"
              >
                <div className="text-[80px] font-extrabold font-heading text-gray-100 leading-none mb-4">
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-[#2E7D32]" />
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-[#1B5E20] py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold font-heading text-white mb-6 leading-tight"
          >
            Ready to talk to your <span className="font-serif italic font-normal">documents</span>?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.1}
            className="text-green-200 text-lg mb-10 max-w-lg mx-auto"
          >
            Join today and experience the future of document interaction. No credit card required.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.2}
            className="flex flex-wrap justify-center gap-3.5"
          >
            <Link to="/auth?mode=signup">
              <button className="bg-white text-[#1B5E20] font-bold px-5 py-3 sm:px-8 sm:py-4 rounded-full hover:bg-green-50 transition-all text-sm sm:text-[15px]">
                Create Free Account →
              </button>
            </Link>
            <Link to="/auth?mode=login">
              <button className="bg-transparent text-white font-semibold px-5 py-3 sm:px-8 sm:py-4 rounded-full border-2 border-white/30 hover:border-white/60 transition-all text-sm sm:text-[15px]">
                Sign In
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
