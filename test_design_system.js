#!/usr/bin/env node

/**
 * Script de test pour vérifier la cohérence du design system
 * Vérifie les problèmes de contraste et les boutons mal configurés
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs et contrastes problématiques à détecter
const PROBLEMATIC_PATTERNS = [
  // Classes hardcodées qui devraient utiliser le design system
  /bg-white.*text-gray-\d+/g,
  /text-gray-\d+.*bg-white/g,
  /border-gray-\d+.*text-gray-\d+.*bg-white/g,
  
  // Boutons avec des classes hardcodées au lieu des variants
  /className="[^"]*hover:bg-orange-\d+[^"]*"/g,
  /className="[^"]*hover:text-orange-\d+[^"]*"/g,
  
  // Doublons de variants
  /variant="[^"]*"[^>]*variant="/g,
];

// Patterns recommandés
const GOOD_PATTERNS = [
  /variant="(default|outline|secondary|destructive|ghost|link|success|warning|info)"/g,
  /className="[^"]*bg-background[^"]*"/g,
  /className="[^"]*text-foreground[^"]*"/g,
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Vérifier les patterns problématiques
  PROBLEMATIC_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'problematic',
        pattern: pattern.toString(),
        matches: matches,
        line: getLineNumbers(content, matches[0])
      });
    }
  });
  
  return issues;
}

function getLineNumbers(content, searchString) {
  const lines = content.split('\n');
  const lineNumbers = [];
  
  lines.forEach((line, index) => {
    if (line.includes(searchString)) {
      lineNumbers.push(index + 1);
    }
  });
  
  return lineNumbers;
}

function scanDirectory(dir) {
  const results = {};
  
  function scanRecursive(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanRecursive(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const issues = scanFile(filePath);
        if (issues.length > 0) {
          results[filePath] = issues;
        }
      }
    });
  }
  
  scanRecursive(dir);
  return results;
}

// Scanner le dossier src/components
const srcPath = path.join(__dirname, 'src', 'components');
console.log('🔍 Scanning design system issues...\n');

const results = scanDirectory(srcPath);

if (Object.keys(results).length === 0) {
  console.log('✅ Aucun problème de design system détecté !');
} else {
  console.log('⚠️  Problèmes détectés dans le design system :\n');
  
  Object.entries(results).forEach(([file, issues]) => {
    console.log(`📄 ${file.replace(__dirname + '/', '')}`);
    
    issues.forEach(issue => {
      console.log(`  ❌ ${issue.type}: ${issue.pattern}`);
      console.log(`     Lignes: ${issue.line.join(', ')}`);
      console.log(`     Matches: ${issue.matches.slice(0, 2).join(', ')}${issue.matches.length > 2 ? '...' : ''}\n`);
    });
  });
  
  console.log(`\n📊 Résumé: ${Object.keys(results).length} fichiers avec des problèmes`);
}

// Vérifier les performances CSS
console.log('\n🚀 Vérification des performances CSS...');

const cssPath = path.join(__dirname, 'src', 'index.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const cssSize = Buffer.byteLength(cssContent, 'utf8');
  
  console.log(`📏 Taille du CSS: ${(cssSize / 1024).toFixed(2)} KB`);
  
  // Compter les variables CSS
  const cssVariables = cssContent.match(/--[a-zA-Z-]+:/g);
  console.log(`🎨 Variables CSS: ${cssVariables ? cssVariables.length : 0}`);
  
  // Vérifier les doublons de couleurs
  const colorValues = cssContent.match(/#[0-9A-Fa-f]{6}/g);
  const uniqueColors = [...new Set(colorValues)];
  console.log(`🌈 Couleurs uniques: ${uniqueColors.length}`);
  
  if (cssSize > 50 * 1024) {
    console.log('⚠️  CSS volumineux, considérer l\'optimisation');
  } else {
    console.log('✅ Taille CSS optimale');
  }
}

console.log('\n🏁 Scan terminé !');
