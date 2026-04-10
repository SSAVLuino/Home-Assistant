import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Check } from 'lucide-react'
import Image from 'next/image'

export default async function UpgradePage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Carica piani
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .not('name', 'eq', 'admin')
    .order('display_order')

  // Carica piano attuale utente
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan_id')
    .eq('user_id', user.id)
    .single()

  const currentPlanId = profile?.plan_id

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla dashboard
        </Link>

        <div className="flex justify-center mb-6">
          <Image
            src="/scadix.png"
            alt="Scadix Logo"
            width={120}
            height={120}
            className="rounded-2xl shadow-lg"
            priority
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          Passa a Scadix Premium
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Sblocca tutte le funzionalità avanzate
        </p>

        {/* Grid Piani */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {plans?.map((plan: any) => (
            <div
              key={plan.id}
              className={`rounded-2xl shadow-xl border-2 overflow-hidden ${
                plan.id === currentPlanId
                  ? 'border-primary-600 bg-gradient-to-br from-primary-50 to-white'
                  : 'border-gray-200 bg-white hover:shadow-2xl transition-shadow'
              }`}
            >
              <div className={`p-8 text-white ${plan.id === currentPlanId ? 'bg-gradient-to-r from-primary-600 to-green-600' : 'bg-gradient-to-r from-primary-600 to-green-600'}`}>
                <h2 className="text-3xl font-bold">{plan.label}</h2>
                {plan.description && <p className="text-primary-100 mt-2">{plan.description}</p>}
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 || !plan.price ? 'Gratuito' : `€${(plan.price * 12).toFixed(2)}`}
                  </span>
                  {plan.price !== 0 && plan.price && <span className="text-gray-600 ml-2">/anno</span>}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cosa ottieni:</h3>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Progetti</h4>
                      <p className="text-sm text-gray-600">{plan.max_projects === null ? 'Illimitati' : plan.max_projects}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Asset</h4>
                      <p className="text-sm text-gray-600">{plan.max_assets === null ? 'Illimitati' : plan.max_assets}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Scadenze</h4>
                      <p className="text-sm text-gray-600">{plan.max_deadlines === null ? 'Illimitati' : plan.max_deadlines}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.can_edit_value_lists ? 'text-green-600' : 'text-gray-300'}`} />
                    <div>
                      <h4 className="font-semibold text-gray-900">Value Lists</h4>
                      <p className="text-sm text-gray-600">{plan.can_edit_value_lists ? 'Modificabili' : 'Non disponibile'}</p>
                    </div>
                  </li>
                </ul>

                {plan.id === currentPlanId && (
                  <div className="text-center py-3 px-4 rounded-lg bg-primary-100 text-primary-700 font-semibold">
                    ✓ Piano Attuale
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Banner Email */}
        <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-xl p-8 border-2 border-primary-200 max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <Mail className="h-12 w-12 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Richiedi l'upgrade</h3>
              <p className="text-gray-700 mb-4">Per passare a un piano superiore, contattaci:</p>
              
                href={`mailto:scadix@cesena.biz?subject=Richiesta upgrade - Scadix&body=Ciao,%0D%0A%0D%0ASono interessato a passare a un piano superiore di Scadix.%0D%0A%0D%0AAccount: ${user.email}%0D%0AID: ${user.id}%0D%0A%0D%0AAttendo vostre comunicazioni.%0D%0A%0D%0AGrazie`}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg"
              >
                <Mail className="h-5 w-5" />
                scadix@cesena.biz
              </a>
              <p className="text-sm text-gray-600 mt-4">Ti risponderemo entro 24 ore</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
