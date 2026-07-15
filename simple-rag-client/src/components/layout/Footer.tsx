import { ExternalLink, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GiWhiteBook } from 'react-icons/gi';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <GiWhiteBook className="h-8 w-8 text-[#2E7D32] group-hover:text-[#1B5E20] transition-colors" />
              <span className="font-heading text-lg font-extrabold tracking-tight text-gray-900">
                RAG Book<span className="text-[#2E7D32]">.</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Turn your documents into interactive knowledge books. 
              Upload, index, and query with AI — built for researchers, students, and professionals.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-300">Find us on</span>
              <span className="w-8 h-px bg-gray-200" />
              <a href="#" className="text-gray-400 hover:text-[#2E7D32] transition-colors"><ExternalLink className="w-4 h-4" /></a>
              <a href="#" className="text-gray-400 hover:text-[#2E7D32] transition-colors"><Globe className="w-4 h-4" /></a>
              <a href="#" className="text-gray-400 hover:text-[#2E7D32] transition-colors"><Mail className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">How It Works</a></li>
              <li><Link to="/auth?mode=signup" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} RAG Book. Built with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
