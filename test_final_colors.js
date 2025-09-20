// Test final du système de couleurs personnalisées
console.log('🎨 Test final du système de couleurs personnalisées...\n')

// Fonction pour tester toutes les variables CSS
function testAllCSSVariables() {
  console.log('1️⃣ Test de toutes les variables CSS...')
  
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
  
  let allVariablesSet = true
  
  variables.forEach(variable => {
    const value = getComputedStyle(root).getPropertyValue(variable)
    if (value && value.trim() !== '') {
      console.log(`   ✅ ${variable}: ${value}`)
    } else {
      console.log(`   ❌ ${variable}: non définie`)
      allVariablesSet = false
    }
  })
  
  if (allVariablesSet) {
    console.log('   🎉 Toutes les variables CSS sont définies !')
  } else {
    console.log('   ⚠️  Certaines variables CSS ne sont pas définies')
  }
  
  return allVariablesSet
}

// Fonction pour tester les classes Tailwind
function testTailwindClasses() {
  console.log('\n2️⃣ Test des classes Tailwind...')
  
  const testClasses = [
    { class: 'text-primary', description: 'Texte primaire' },
    { class: 'text-secondary', description: 'Texte secondaire' },
    { class: 'text-accent', description: 'Texte accent' },
    { class: 'bg-primary', description: 'Fond primaire' },
    { class: 'bg-secondary', description: 'Fond secondaire' },
    { class: 'bg-accent', description: 'Fond accent' },
    { class: 'border-primary', description: 'Bordure primaire' },
    { class: 'border-secondary', description: 'Bordure secondaire' },
    { class: 'border-accent', description: 'Bordure accent' },
    { class: 'hover:bg-primary', description: 'Hover primaire' },
    { class: 'hover:bg-secondary', description: 'Hover secondaire' },
    { class: 'hover:bg-accent', description: 'Hover accent' }
  ]
  
  let classesFound = 0
  
  testClasses.forEach(({ class: className, description }) => {
    const elements = document.querySelectorAll(`.${className}`)
    if (elements.length > 0) {
      console.log(`   ✅ ${description}: ${elements.length} élément(s)`)
      classesFound++
    } else {
      console.log(`   ⚠️  ${description}: aucun élément trouvé`)
    }
  })
  
  console.log(`   📊 ${classesFound}/${testClasses.length} classes trouvées`)
  return classesFound > 0
}

// Fonction pour tester l'application des couleurs
function testColorApplication() {
  console.log('\n3️⃣ Test d\'application des couleurs...')
  
  const testColors = [
    { name: 'Bleu', primary: '#1976D2', secondary: '#42A5F5', tertiary: '#64B5F6' },
    { name: 'Vert', primary: '#388E3C', secondary: '#66BB6A', tertiary: '#81C784' },
    { name: 'Violet', primary: '#7B1FA2', secondary: '#AB47BC', tertiary: '#BA68C8' },
    { name: 'Rouge', primary: '#D32F2F', secondary: '#F44336', tertiary: '#EF5350' }
  ]
  
  let currentIndex = 0
  
  function applyNextColor() {
    if (currentIndex >= testColors.length) {
      console.log('   ✅ Test d\'application terminé')
      return
    }
    
    const color = testColors[currentIndex]
    console.log(`   🎨 Application de la palette ${color.name}...`)
    
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
    
    console.log(`   ✅ Palette ${color.name} appliquée`)
    
    currentIndex++
    setTimeout(applyNextColor, 1500)
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

// Fonction pour vérifier les éléments spécifiques
function testSpecificElements() {
  console.log('\n4️⃣ Test des éléments spécifiques...')
  
  const elements = [
    { selector: 'button', description: 'Boutons' },
    { selector: '.badge', description: 'Badges' },
    { selector: 'input', description: 'Champs de saisie' },
    { selector: '.card', description: 'Cards' },
    { selector: '.text-primary', description: 'Texte primaire' },
    { selector: '.text-secondary', description: 'Texte secondaire' },
    { selector: '.text-accent', description: 'Texte accent' },
    { selector: '.bg-primary', description: 'Fond primaire' },
    { selector: '.bg-secondary', description: 'Fond secondaire' },
    { selector: '.bg-accent', description: 'Fond accent' }
  ]
  
  elements.forEach(({ selector, description }) => {
    const found = document.querySelectorAll(selector)
    if (found.length > 0) {
      console.log(`   ✅ ${description}: ${found.length} élément(s) trouvé(s)`)
    } else {
      console.log(`   ⚠️  ${description}: aucun élément trouvé`)
    }
  })
}

// Exécuter tous les tests
console.log('🚀 Démarrage des tests complets...\n')

// Test des variables CSS
const variablesOK = testAllCSSVariables()

// Test des classes Tailwind
const classesOK = testTailwindClasses()

// Test des éléments spécifiques
testSpecificElements()

// Test d'application des couleurs
testColorApplication()

// Résumé final
setTimeout(() => {
  console.log('\n📊 Résumé des tests:')
  console.log(`   Variables CSS: ${variablesOK ? '✅ OK' : '❌ Problème'}`)
  console.log(`   Classes Tailwind: ${classesOK ? '✅ OK' : '❌ Problème'}`)
  console.log('   Application des couleurs: ✅ En cours...')
  
  console.log('\n🎉 Tests terminés !')
  console.log('\n💡 Instructions pour tester manuellement:')
  console.log('1. Ouvrez la page de personnalisation des couleurs')
  console.log('2. Changez les couleurs primaires, secondaires et tertiaires')
  console.log('3. Vérifiez que tous les éléments changent de couleur')
  console.log('4. Utilisez le bouton "Forcer" si certains éléments ne changent pas')
  console.log('5. Utilisez le bouton "Test" pour appliquer des couleurs de test')
  console.log('6. Vérifiez la sidebar, les boutons, les liens, et tous les éléments')
}, 10000)
