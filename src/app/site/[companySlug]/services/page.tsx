import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import StoreHeader from '../components/StoreHeader';
import { Search, CheckCircle, Package, Truck, Shield, Headphones, Globe, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getCompany(slug: string) {
  const { data: company } = await supabase
    .from('companies')
    .select(`
      id, name, slug, logo_url,
      settings:website_settings (primary_color)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  return company;
}

export default async function ServicesPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const company = await getCompany(params.companySlug);

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Store not found</p>
      </div>
    );
  }

  const settings = Array.isArray(company.settings) ? company.settings[0] : company.settings;
  const themeColor = settings?.primary_color || '#3B82F6';

  const services = [
    {
      icon: Search,
      title: 'Product Sourcing',
      description: 'We find the best manufacturers and suppliers for your products. Get competitive pricing and reliable quality from verified factories.',
      features: ['Factory verification', 'Price negotiation', 'Sample arrangement', 'MOQ optimization'],
    },
    {
      icon: CheckCircle,
      title: 'Quality Inspection',
      description: 'Our QC team ensures your products meet specifications before shipping. We catch defects early to save you time and money.',
      features: ['Pre-shipment inspection', 'During production check', 'Factory audit', 'Defect reporting'],
    },
    {
      icon: Package,
      title: 'Warehousing',
      description: 'Store your products in our secure warehouses. Consolidate shipments and reduce shipping costs with our storage solutions.',
      features: ['30 days free storage', 'Inventory management', 'Order consolidation', 'Repackaging service'],
    },
    {
      icon: Truck,
      title: 'Global Shipping',
      description: 'Fast and reliable shipping to anywhere in the world. Choose from air, sea, or rail options based on your needs.',
      features: ['Air freight (3-7 days)', 'Sea freight (15-35 days)', 'Express delivery', 'DDP/DDU options'],
    },
  ];

  const whyChooseUs = [
    { icon: Shield, title: 'Secure Payments', description: 'Your funds are protected with our escrow system' },
    { icon: Headphones, title: '24/7 Support', description: 'Dedicated agent available round the clock' },
    { icon: Globe, title: 'Global Network', description: 'Partners in 50+ countries worldwide' },
    { icon: DollarSign, title: 'Best Prices', description: 'Direct factory access for competitive rates' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader 
        companyName={company.name} 
        logoUrl={company.logo_url} 
        themeColor={themeColor} 
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            End-to-end sourcing and logistics solutions to help your business grow. 
            From finding suppliers to delivering products to your door.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: themeColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: themeColor }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Tell us about your sourcing needs and get a free quote within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/site/${params.companySlug}/quote`}
              className="px-8 py-3 text-white font-medium rounded-lg transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              Request a Quote
            </Link>
            <Link
              href={`/site/${params.companySlug}/products`}
              className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">
              © {new Date().getFullYear()} {company.name}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href={`/site/${params.companySlug}/terms`} className="text-gray-400 hover:text-white">
                Terms
              </Link>
              <Link href={`/site/${params.companySlug}/privacy`} className="text-gray-400 hover:text-white">
                Privacy
              </Link>
              <Link href={`/site/${params.companySlug}/contact`} className="text-gray-400 hover:text-white">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}





