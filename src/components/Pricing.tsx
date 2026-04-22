import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Single Guide',
    price: '₱79',
    period: '/guide',
    description: 'Pay exactly for what you need when you need it.',
    features: [
      'Step-by-step verified instructions',
      'Exact requirements checklist',
      'Local office tips & warnings',
      'Lifetime access to updates',
    ],
    cta: 'Browse Guides',
    link: '/#guides',
    mostPopular: false,
  },
  {
    name: 'Life Stage Bundle',
    price: '₱199',
    period: ' & up',
    description: 'Save up to 40% when tackling major life transitions.',
    features: [
      'Complete collection mapping a life stage',
      'All single guide benefits included',
      'Recommended sequence of processes',
      'Priority support access',
    ],
    cta: 'View Bundles',
    link: '/#guides',
    mostPopular: true,
  },
];

export default function Pricing() {
  return (
    <div id="pricing" className="bg-slate-50 py-20 sm:py-32 mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
           <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-sm uppercase tracking-widest mb-4">
             Simple Pricing
           </span>
          <h2 className="text-4xl font-extrabold text-slate-900 sm:text-5xl mb-6">Adulting, unbundled.</h2>
          <p className="text-xl text-slate-500 font-medium">
            No subscriptions. No hidden fees. Pay only for the guides you actually need to survive in the Philippines.
          </p>
        </div>
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-8 lg:max-w-4xl lg:mx-auto xl:max-w-4xl xl:mx-auto">
          {tiers.map((tier) => (
            <div key={tier.name} className={'rounded-3xl shadow-sm border-2 overflow-hidden flex flex-col ' + (tier.mostPopular ? 'border-blue-500 bg-white relative' : 'border-slate-200 bg-white')}>
              {tier.mostPopular && (
                <div className="bg-blue-500 text-white text-center py-2 text-xs font-bold uppercase tracking-widest">
                  Best Value
                </div>
              )}
              <div className="p-8 md:p-10 flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-slate-500 font-medium mb-8 min-h-[48px]">{tier.description}</p>
                <div className="mb-8 flex items-baseline text-slate-900">
                  <span className="text-5xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.period && <span className="ml-1 text-xl font-semibold text-slate-500">{tier.period}</span>}
                </div>
                
                <ul role="list" className="space-y-5 mb-10 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-4 w-4 text-blue-600" strokeWidth={3} />
                      </div>
                      <span className="text-slate-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={tier.link}
                  className={'w-full py-4 px-6 rounded-xl flex items-center justify-center text-lg font-bold transition-all mt-auto ' + (
                    tier.mostPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  )}
                >
                  {tier.cta} {tier.mostPopular && <ArrowRight size={20} className="ml-2" />}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
