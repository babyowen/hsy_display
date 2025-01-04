export default function Footer() {
  return (
    <footer className="w-full py-4 mt-8 bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-8 lg:px-16">
        <div className="text-center text-sm text-gray-500">
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-700 transition-colors"
          >
            苏ICP备08105700号-3
          </a>
        </div>
      </div>
    </footer>
  );
} 