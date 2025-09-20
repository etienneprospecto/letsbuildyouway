/**
 * Utilitaires pour la génération et manipulation de couleurs
 * Système de thèmes personnalisables BYW
 */

export interface HSLColor {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

export interface RGBColor {
  r: number; // Red (0-255)
  g: number; // Green (0-255)
  b: number; // Blue (0-255)
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  // Variations de luminosité
  primary50: string;
  primary100: string;
  primary200: string;
  primary300: string;
  primary400: string;
  primary500: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;
  // Versions pour mode sombre
  primaryDark: string;
  secondaryDark: string;
  accentDark: string;
}

export class ColorUtils {
  /**
   * Convertit une couleur HEX en HSL
   */
  static hexToHsl(hex: string): HSLColor {
    // Supprimer le # si présent
    hex = hex.replace('#', '');
    
    // Convertir en RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convertit une couleur HSL en HEX
   */
  static hslToHex(h: number, s: number, l: number): string {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // Achromatique
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Convertit HEX en RGB
   */
  static hexToRgb(hex: string): RGBColor {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }

  /**
   * Génère une palette complète à partir d'une couleur de base
   */
  static generateColorPalette(baseColor: string): ColorPalette {
    const hsl = this.hexToHsl(baseColor);
    
    // Générer les variations de luminosité pour la couleur primaire
    const lightnesses = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10];
    const primaryVariations: { [key: string]: string } = {};
    
    lightnesses.forEach((lightness, index) => {
      const shade = (index + 1) * (index === 0 ? 50 : 100);
      primaryVariations[`primary${shade}`] = this.hslToHex(hsl.h, hsl.s, lightness);
    });

    // Générer couleurs harmonieuses
    const secondary = this.generateHarmoniousColor(baseColor, 'analogous');
    const accent = this.generateHarmoniousColor(baseColor, 'complementary');
    
    // Adapter pour mode sombre
    const primaryDark = this.adaptForDarkMode(baseColor);
    const secondaryDark = this.adaptForDarkMode(secondary);
    const accentDark = this.adaptForDarkMode(accent);

    return {
      primary: baseColor,
      secondary,
      accent,
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      ...primaryVariations,
      primaryDark,
      secondaryDark,
      accentDark
    };
  }

  /**
   * Génère une couleur harmonieuse selon le type
   */
  static generateHarmoniousColor(baseColor: string, type: 'analogous' | 'complementary' | 'triadic'): string {
    const hsl = this.hexToHsl(baseColor);
    let newHue = hsl.h;

    switch (type) {
      case 'analogous':
        // Couleur analogue (30° de différence)
        newHue = (hsl.h + 30) % 360;
        break;
      case 'complementary':
        // Couleur complémentaire (180° de différence)
        newHue = (hsl.h + 180) % 360;
        break;
      case 'triadic':
        // Couleur triadique (120° de différence)
        newHue = (hsl.h + 120) % 360;
        break;
    }

    // Ajuster la saturation et luminosité pour harmonie
    const newSaturation = Math.max(20, hsl.s - 10);
    const newLightness = Math.min(80, Math.max(20, hsl.l + 10));

    return this.hslToHex(newHue, newSaturation, newLightness);
  }

  /**
   * Adapte une couleur pour le mode sombre
   */
  static adaptForDarkMode(color: string): string {
    const hsl = this.hexToHsl(color);
    
    // Réduire la saturation et augmenter la luminosité pour mode sombre
    const newSaturation = Math.max(0, hsl.s - 20);
    const newLightness = Math.min(100, hsl.l + 15);
    
    return this.hslToHex(hsl.h, newSaturation, newLightness);
  }

  /**
   * Calcule le ratio de contraste entre deux couleurs
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Détermine si le texte doit être blanc ou noir selon le contraste
   */
  static getContrastColor(backgroundColor: string): string {
    const whiteContrast = this.getContrastRatio(backgroundColor, '#FFFFFF');
    const blackContrast = this.getContrastRatio(backgroundColor, '#000000');
    
    return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
  }

  /**
   * Valide l'accessibilité d'une combinaison de couleurs
   */
  static validateAccessibility(foreground: string, background: string): {
    isValid: boolean;
    ratio: number;
    grade: 'AAA' | 'AA' | 'Fail';
    recommendation?: string;
  } {
    const ratio = this.getContrastRatio(foreground, background);
    
    let grade: 'AAA' | 'AA' | 'Fail';
    let recommendation: string | undefined;

    if (ratio >= 7) {
      grade = 'AAA';
    } else if (ratio >= 4.5) {
      grade = 'AA';
    } else {
      grade = 'Fail';
      recommendation = 'Augmentez le contraste pour améliorer l\'accessibilité';
    }

    return {
      isValid: ratio >= 4.5,
      ratio: Math.round(ratio * 100) / 100,
      grade,
      recommendation
    };
  }

  /**
   * Simule la vision daltonienne
   */
  static simulateColorBlindness(color: string, type: 'protanopia' | 'deuteranopia' | 'tritanopia'): string {
    const rgb = this.hexToRgb(color);
    const { r, g, b } = rgb;

    let newR, newG, newB;

    switch (type) {
      case 'protanopia': // Rouge-vert (protanopie)
        newR = 0.567 * r + 0.433 * g;
        newG = 0.558 * r + 0.442 * g;
        newB = 0.242 * g + 0.758 * b;
        break;
      case 'deuteranopia': // Rouge-vert (deutéranopie)
        newR = 0.625 * r + 0.375 * g;
        newG = 0.7 * r + 0.3 * g;
        newB = 0.3 * g + 0.7 * b;
        break;
      case 'tritanopia': // Bleu-jaune (tritanopie)
        newR = 0.95 * r + 0.05 * g;
        newG = 0.433 * r + 0.567 * g;
        newB = 0.475 * g + 0.525 * b;
        break;
    }

    const toHex = (c: number) => {
      const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }

  /**
   * Génère un dégradé CSS à partir de deux couleurs
   */
  static generateGradient(color1: string, color2: string, direction: 'horizontal' | 'vertical' | 'diagonal' = 'diagonal'): string {
    const angle = direction === 'horizontal' ? '90deg' : 
                  direction === 'vertical' ? '180deg' : '135deg';
    
    return `linear-gradient(${angle}, ${color1} 0%, ${color2} 100%)`;
  }

  /**
   * Génère des couleurs aléatoires harmonieuses
   */
  static generateRandomHarmoniousPalette(): ColorPalette {
    const baseHue = Math.floor(Math.random() * 360);
    const baseColor = this.hslToHex(baseHue, 70, 50);
    
    return this.generateColorPalette(baseColor);
  }
}
