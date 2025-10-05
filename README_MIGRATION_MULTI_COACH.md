# 🚀 MIGRATION MULTI-COACH SAAS - GUIDE COMPLET

## 📋 RÉSUMÉ DE LA MIGRATION

Cette migration transforme ton SaaS mono-coach en système multi-coach complet avec :
- **Système d'abonnement Stripe** pour nouveaux coachs
- **Isolation des données** par coach (RLS)
- **Invitation clients** avec tokens sécurisés
- **Limites par pack** (Warm-Up, Transformationnel, Elite)
- **Migration sans casse** de l'existant

---

## 🗂️ FICHIERS CRÉÉS

### 1. **Migration SQL**
- `migration_multi_coach_complete.sql` - Script de migration complet

### 2. **APIs Backend**
- `webhook_stripe_coach_signup.ts` - Webhook Stripe pour nouveaux coachs
- `invite_client_api.ts` - API d'invitation clients
- `create_checkout_session_api.ts` - API création session Stripe

### 3. **Pages Frontend**
- `setup_account_page.tsx` - Configuration compte après paiement
- `accept_invitation_page.tsx` - Acceptation invitation client
- `pricing_page_component.tsx` - Page de tarification
- `coach_dashboard_component.tsx` - Dashboard coach avec limites

---

## 🛠️ ÉTAPES D'IMPLÉMENTATION

### **ÉTAPE 1 : Migration Base de Données**
```bash
# 1. Exécuter le script SQL dans Supabase
# Aller dans Supabase Dashboard > SQL Editor
# Copier-coller le contenu de migration_multi_coach_complete.sql
# Cliquer sur "Run"
```

### **ÉTAPE 2 : Configuration Stripe**
```bash
# 1. Créer les produits dans Stripe Dashboard
# 2. Récupérer les Price IDs et les mettre dans create_checkout_session_api.ts
# 3. Configurer le webhook : https://tonsite.com/api/webhooks/stripe
# 4. Événements à écouter : checkout.session.completed, customer.subscription.deleted
```

### **ÉTAPE 3 : Variables d'Environnement**
```bash
# Ajouter dans .env.local
NEXT_PUBLIC_SUPABASE_URL=ton_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton_anon_key
SUPABASE_SERVICE_ROLE_KEY=ton_service_role_key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (optionnel)
RESEND_API_KEY=re_...
```

### **ÉTAPE 4 : Intégration Frontend**
```bash
# 1. Créer les dossiers API
mkdir -p app/api/webhooks/stripe
mkdir -p app/api/invite-client
mkdir -p app/api/create-checkout-session

# 2. Déplacer les fichiers API
mv webhook_stripe_coach_signup.ts app/api/webhooks/stripe/route.ts
mv invite_client_api.ts app/api/invite-client/route.ts
mv create_checkout_session_api.ts app/api/create-checkout-session/route.ts

# 3. Créer les pages
mkdir -p app/setup-account
mkdir -p app/accept-invitation
mkdir -p app/pricing

mv setup_account_page.tsx app/setup-account/page.tsx
mv accept_invitation_page.tsx app/accept-invitation/page.tsx
mv pricing_page_component.tsx app/pricing/page.tsx

# 4. Intégrer le dashboard coach
mv coach_dashboard_component.tsx components/CoachDashboard.tsx
```

---

## 🔧 MODIFICATIONS NÉCESSAIRES

### **1. Mettre à jour AuthProvider.tsx**
```typescript
// Remplacer la whitelist hardcodée par une vérification en base
const { data: coachProfile } = await supabase
  .from('profiles')
  .select('id, role, subscription_status')
  .eq('email', email)
  .eq('role', 'coach')
  .single();

const isCoach = coachProfile && coachProfile.subscription_status === 'active';
```

### **2. Mettre à jour accessValidationService.ts**
```typescript
// Remplacer la whitelist par une vérification en base
const { data: coachProfile } = await supabase
  .from('profiles')
  .select('id, role, subscription_status')
  .eq('email', normalizedEmail)
  .eq('role', 'coach')
  .single();

if (coachProfile && coachProfile.subscription_status === 'active') {
  return {
    hasAccess: true,
    role: 'coach',
    coachId: coachProfile.id,
  };
}
```

### **3. Ajouter le middleware de protection**
```typescript
// Créer middleware.ts à la racine
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Routes publiques
  const publicRoutes = ['/', '/pricing', '/setup-account', '/accept-invitation'];
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 🧪 TESTS À EFFECTUER

### **Test 1 : Migration existante**
```sql
-- Vérifier qu'Etienne est configuré
SELECT * FROM profiles WHERE email = 'etienne.guimbard@gmail.com';
-- Doit avoir : role='coach', subscription_plan='elite'

-- Vérifier que Paul est lié
SELECT c.*, p.email as coach_email 
FROM clients c 
JOIN profiles p ON c.coach_id = p.id 
WHERE c.email = 'Paulfst.business@gmail.com';
```

### **Test 2 : Nouveau coach via Stripe**
1. Aller sur `/pricing`
2. Cliquer sur un pack
3. Utiliser carte test : `4242 4242 4242 4242`
4. Vérifier l'email de configuration
5. Configurer le compte
6. Vérifier l'accès au dashboard

### **Test 3 : Invitation client**
1. En tant que coach, inviter un client
2. Vérifier l'email d'invitation
3. Client accepte l'invitation
4. Vérifier la connexion client

### **Test 4 : Limites de pack**
1. Coach Warm-Up (15 clients max)
2. Essayer d'ajouter un 16ème client
3. Doit afficher erreur de limite

---

## 📊 STRUCTURE FINALE

### **Tables avec coach_id :**
- ✅ `profiles` (pour les clients)
- ✅ `clients`
- ✅ `workouts`
- ✅ `exercises`
- ✅ `messages`
- ✅ `conversations`
- ✅ `feedbacks_hebdomadaires`
- ✅ `feedback_templates`
- ✅ `feedback_questions`
- ✅ `seances` (si existe)
- ✅ `appointments` (si existe)
- ✅ `nutrition_entries` (si existe)
- ✅ `progress_data` (si existe)

### **Nouveaux champs profiles :**
- ✅ `subscription_plan` (warm_up, transformationnel, elite)
- ✅ `stripe_customer_id`
- ✅ `stripe_subscription_id`
- ✅ `subscription_status`
- ✅ `plan_limits` (JSON)
- ✅ `current_clients_count`
- ✅ `current_workouts_count`
- ✅ `current_exercises_count`
- ✅ `account_setup_token`

### **RLS configuré :**
- ✅ Isolation complète des données par coach
- ✅ Clients voient seulement leurs données
- ✅ Coachs voient seulement leurs clients

---

## ⚠️ POINTS IMPORTANTS

1. **Service Role Key** : Nécessaire pour le webhook Stripe
2. **HTTPS requis** : Pour le webhook en production
3. **Emails** : Implémenter Resend ou SendGrid
4. **Price IDs** : Récupérer depuis Stripe Dashboard
5. **Tests** : Tester chaque pack et chaque limite

---

## 🎯 RÉSULTAT FINAL

Après cette migration, tu auras :
- ✅ **Système multi-coach** complet
- ✅ **Paiements Stripe** automatisés
- ✅ **Isolation des données** par coach
- ✅ **Invitations clients** sécurisées
- ✅ **Limites par pack** respectées
- ✅ **Migration sans casse** de l'existant

**🚀 Ton SaaS est prêt pour la commercialisation !**
