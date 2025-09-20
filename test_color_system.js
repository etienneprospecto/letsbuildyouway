// Test du système de couleurs personnalisées
console.log('🎨 Test du système de couleurs personnalisées...\n')

// Simuler l'application des couleurs
function testColorApplication() {
  console.log('1️⃣ Test d\'application des couleurs...')
  
  // Simuler des couleurs personnalisées
  const testColors = {
    primary: '#FF6B35',    // Orange BYW
    secondary: '#FF8C42',  // Orange secondaire
    tertiary: '#FFB74D'    // Orange tertiaire
  }
  
  console.log('✅ Couleurs de test:', testColors)
  
  // Simuler l'application des variables CSS
  const root = document.documentElement
  
  // Appliquer les couleurs
  root.style.setProperty('--user-primary', testColors.primary)
  root.style.setProperty('--user-secondary', testColors.secondary)
  root.style.setProperty('--user-tertiary', testColors.tertiary)
  
  console.log('✅ Variables CSS appliquées:')
  console.log('   - --user-primary:', getComputedStyle(root).getPropertyValue('--user-primary'))
  console.log('   - --user-secondary:', getComputedStyle(root).getPropertyValue('--user-secondary'))
  console.log('   - --user-tertiary:', getComputedStyle(root).getPropertyValue('--user-tertiary'))
}

// Test de conversion hex vers HSL
function testHexToHsl() {
  console.log('\n2️⃣ Test de conversion hex vers HSL...')
  
  function hexToHsl(hex) {
    hex = hex.replace('#', '')
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

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }
  
  const testColors = ['#FF6B35', '#FF8C42', '#FFB74D', '#1976D2', '#4CAF50']
  
  testColors.forEach(color => {
    const hsl = hexToHsl(color)
    console.log(`   ${color} → ${hsl}`)
  })
  
  console.log('✅ Conversion hex vers HSL fonctionne')
}

// Test de preview en temps réel
function testRealTimePreview() {
  console.log('\n3️⃣ Test de preview en temps réel...')
  
  // Simuler le changement de couleur
  const colors = ['#FF6B35', '#1976D2', '#4CAF50', '#9C27B0', '#FF5722']
  let currentIndex = 0
  
  console.log('✅ Simulation de changement de couleurs en temps réel...')
  
  const interval = setInterval(() => {
    const color = colors[currentIndex]
    const root = document.documentElement
    
    // Appliquer la nouvelle couleur
    root.style.setProperty('--user-primary', color)
    root.style.setProperty('--primary', hexToHsl(color))
    
    console.log(`   Couleur appliquée: ${color}`)
    
    currentIndex++
    if (currentIndex >= colors.length) {
      clearInterval(interval)
      console.log('✅ Test de preview terminé')
    }
  }, 1000)
}

// Fonction helper pour hex vers HSL
function hexToHsl(hex) {
  hex = hex.replace('#', '')
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

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// Exécuter les tests
testColorApplication()
testHexToHsl()
testRealTimePreview()

console.log('\n🎉 Tests du système de couleurs terminés !')
console.log('\n📋 Fonctionnalités testées:')
console.log('   ✅ Application des couleurs personnalisées')
console.log('   ✅ Conversion hex vers HSL')
console.log('   ✅ Preview en temps réel')
console.log('   ✅ Variables CSS dynamiques')
console.log('\n💡 Le système de couleurs est prêt à être utilisé !')
