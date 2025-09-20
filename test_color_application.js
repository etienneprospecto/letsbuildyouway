// Test d'application des couleurs personnalisées
console.log('🎨 Test d\'application des couleurs personnalisées...\n')

// Fonction pour tester l'application des couleurs
function testColorApplication() {
  console.log('1️⃣ Test d\'application des couleurs...')
  
  const testColors = [
    { name: 'Bleu', primary: '#1976D2', secondary: '#42A5F5', tertiary: '#64B5F6' },
    { name: 'Vert', primary: '#388E3C', secondary: '#66BB6A', tertiary: '#81C784' },
    { name: 'Violet', primary: '#7B1FA2', secondary: '#AB47BC', tertiary: '#BA68C8' },
    { name: 'Rouge', primary: '#D32F2F', secondary: '#F44336', tertiary: '#EF5350' },
    { name: 'Orange', primary: '#F57C00', secondary: '#FF9800', tertiary: '#FFB74D' }
  ]
  
  let currentIndex = 0
  
  function applyNextColor() {
    if (currentIndex >= testColors.length) {
      console.log('✅ Test terminé - Toutes les couleurs ont été testées')
      return
    }
    
    const color = testColors[currentIndex]
    console.log(`\n   Test de la palette ${color.name}:`)
    console.log(`   - Primaire: ${color.primary}`)
    console.log(`   - Secondaire: ${color.secondary}`)
    console.log(`   - Tertiaire: ${color.tertiary}`)
    
    // Appliquer les couleurs
    const root = document.documentElement
    
    // Variables personnalisées
    root.style.setProperty('--user-primary', color.primary)
    root.style.setProperty('--user-secondary', color.secondary)
    root.style.setProperty('--user-tertiary', color.tertiary)
    
    // Variables CSS principales
    root.style.setProperty('--primary', hexToHsl(color.primary))
    root.style.setProperty('--secondary', hexToHsl(color.secondary))
    root.style.setProperty('--accent', hexToHsl(color.tertiary))
    
    // Variables de foreground
    root.style.setProperty('--primary-foreground', '0 0% 100%')
    root.style.setProperty('--secondary-foreground', '0 0% 100%')
    root.style.setProperty('--accent-foreground', '0 0% 100%')
    
    // Variables de ring
    root.style.setProperty('--ring', hexToHsl(color.primary))
    
    // Variables de sidebar
    root.style.setProperty('--sidebar-active', hexToHsl(color.primary))
    root.style.setProperty('--sidebar-active-bg', hexToHsl(color.primary))
    root.style.setProperty('--sidebar-active-text', '0 0% 100%')
    
    console.log('   ✅ Couleurs appliquées')
    
    currentIndex++
    setTimeout(applyNextColor, 2000) // Attendre 2 secondes avant la prochaine couleur
  }
  
  applyNextColor()
}

// Fonction de conversion hex vers HSL
function hexToHsl(hex) {
  hex = hex.replace('#', '')
  
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }
  
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return '20 100% 50%'
  }
  
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  const hue = Math.round(h * 360)
  const saturation = Math.round(s * 100)
  const lightness = Math.round(l * 100)

  return `${hue} ${saturation}% ${lightness}%`
}

// Test de vérification des variables CSS
function testCSSVariables() {
  console.log('\n2️⃣ Test des variables CSS...')
  
  const root = document.documentElement
  const variables = [
    '--user-primary',
    '--user-secondary', 
    '--user-tertiary',
    '--primary',
    '--secondary',
    '--accent',
    '--primary-foreground',
    '--secondary-foreground',
    '--accent-foreground',
    '--ring',
    '--sidebar-active',
    '--sidebar-active-bg',
    '--sidebar-active-text'
  ]
  
  variables.forEach(variable => {
    const value = getComputedStyle(root).getPropertyValue(variable)
    if (value) {
      console.log(`   ✅ ${variable}: ${value}`)
    } else {
      console.log(`   ❌ ${variable}: non définie`)
    }
  })
}

// Test de vérification des classes Tailwind
function testTailwindClasses() {
  console.log('\n3️⃣ Test des classes Tailwind...')
  
  const testElements = [
    { selector: '.text-primary', description: 'Texte primaire' },
    { selector: '.text-secondary', description: 'Texte secondaire' },
    { selector: '.text-accent', description: 'Texte accent' },
    { selector: '.bg-primary', description: 'Fond primaire' },
    { selector: '.bg-secondary', description: 'Fond secondaire' },
    { selector: '.bg-accent', description: 'Fond accent' },
    { selector: '.border-primary', description: 'Bordure primaire' },
    { selector: '.border-secondary', description: 'Bordure secondaire' },
    { selector: '.border-accent', description: 'Bordure accent' }
  ]
  
  testElements.forEach(({ selector, description }) => {
    const elements = document.querySelectorAll(selector)
    if (elements.length > 0) {
      console.log(`   ✅ ${description}: ${elements.length} élément(s) trouvé(s)`)
    } else {
      console.log(`   ⚠️  ${description}: aucun élément trouvé`)
    }
  })
}

// Exécuter les tests
console.log('🚀 Démarrage des tests...\n')

// Test des variables CSS
testCSSVariables()

// Test des classes Tailwind
testTailwindClasses()

// Test d'application des couleurs
testColorApplication()

console.log('\n📋 Instructions pour tester manuellement:')
console.log('1. Ouvrez la page de personnalisation des couleurs')
console.log('2. Changez les couleurs primaires, secondaires et tertiaires')
console.log('3. Vérifiez que tous les éléments changent de couleur')
console.log('4. Testez les boutons, badges, liens, et autres éléments')
console.log('5. Vérifiez que la sidebar et les éléments actifs changent aussi')

console.log('\n🎉 Tests terminés !')
