import Link from 'next/link';

interface Company {
  name: string;
  slug: string;
  website_settings: {
    theme_color?: string;
  } | null;
}

interface SiteFooterProps {
  company: Company;
}

export default function SiteFooter({ company }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">{company.name}</h3>
            <p className="text-sm text-gray-400">
              Quality products from trusted sources. We help businesses source the best products globally.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/site/${company.slug}`}
                  className="text-sm hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href={`/site/${company.slug}/products`}
                  className="text-sm hover:text-white transition-colors"
                >
                  Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium mb-4">Contact Us</h4>
            <p className="text-sm text-gray-400">
              Interested in our products? Get in touch for a custom quotation.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} {company.name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Powered by <span className="text-gray-400">SourSync</span>
          </p>
        </div>
      </div>
    </footer>
  );
}





