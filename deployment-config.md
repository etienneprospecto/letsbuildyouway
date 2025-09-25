# Configuration de Déploiement BYW

## 🚀 Prérequis de Production

### Serveur Web
- **Nginx** (recommandé) ou Apache
- Support HTTPS (SSL/TLS)
- Compression gzip activée
- Cache des assets statiques

### Variables d'Environnement
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (Production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Application
VITE_APP_URL=https://your-domain.com
VITE_APP_ENV=production
```

## 📁 Structure de Déploiement

```
/var/www/byw/
├── index.html          # Point d'entrée SPA
├── assets/            # JS, CSS, images optimisés
├── favicon.ico        # Icône du site
└── build-report.txt   # Rapport de build
```

## ⚙️ Configuration Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/byw;
    index index.html;
    
    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Cache des assets statiques
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header Referrer-Policy strict-origin-when-cross-origin;
    }
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://your-project.supabase.co https://api.stripe.com;";
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🔧 Optimisations de Performance

### 1. Préchargement des ressources critiques
```html
<!-- Dans index.html -->
<link rel="preload" href="/assets/main.css" as="style">
<link rel="preload" href="/assets/main.js" as="script">
```

### 2. Service Worker (optionnel)
```javascript
// Pour le cache offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 3. Monitoring
- **Sentry** pour le monitoring d'erreurs
- **Google Analytics** ou **Plausible** pour les statistiques
- **Lighthouse** pour les performances

## 🛡️ Sécurité

### Headers de Sécurité
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://js.stripe.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
connect-src 'self' https://your-project.supabase.co https://api.stripe.com;
```

## 📊 Monitoring et Logs

### 1. Logs d'accès Nginx
```bash
tail -f /var/log/nginx/access.log
```

### 2. Logs d'erreur
```bash
tail -f /var/log/nginx/error.log
```

### 3. Métriques de performance
- Core Web Vitals
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)

## 🔄 CI/CD (Optionnel)

### GitHub Actions
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to server
        run: |
          rsync -avz --delete dist/ user@server:/var/www/byw/
```

## ✅ Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Certificat SSL installé
- [ ] Configuration Nginx/Apache
- [ ] Build de production testé
- [ ] Headers de sécurité configurés
- [ ] Compression gzip activée
- [ ] Cache des assets configuré
- [ ] Monitoring en place
- [ ] Sauvegarde configurée
- [ ] Tests de charge effectués

## 🆘 Dépannage

### Erreurs communes
1. **Page blanche** → Vérifier les chemins d'assets
2. **404 sur refresh** → Configurer SPA routing
3. **Erreurs CORS** → Vérifier les domaines Supabase
4. **Erreurs Stripe** → Vérifier les clés API

### Logs utiles
```bash
# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Vérifier les certificats SSL
openssl x509 -in certificate.crt -text -noout
```

## 📞 Support

En cas de problème, vérifiez :
1. Les logs du serveur web
2. La console du navigateur
3. Les variables d'environnement
4. La configuration Supabase/Stripe
