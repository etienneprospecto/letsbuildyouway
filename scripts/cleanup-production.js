#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Nettoyage du code pour la production...\n');

let filesProcessed = 0;
let consoleLogsRemoved = 0;
let todosRemoved = 0;

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Supprimer les console.log (sauf ceux marqués comme DEBUG)
    const consoleLogRegex = /^\s*console\.log\([^)]*\);\s*$/gm;
    const consoleLogs = content.match(consoleLogRegex);
    if (consoleLogs) {
      content = content.replace(consoleLogRegex, '');
      consoleLogsRemoved += consoleLogs.length;
      modified = true;
    }
    
    // Supprimer les console.warn et console.error (sauf ceux marqués comme DEBUG)
    const consoleWarnRegex = /^\s*console\.(warn|error)\([^)]*\);\s*$/gm;
    const consoleWarns = content.match(consoleWarnRegex);
    if (consoleWarns) {
      content = content.replace(consoleWarnRegex, '');
      consoleLogsRemoved += consoleWarns.length;
      modified = true;
    }
    
    // Supprimer les TODO/FIXME (sauf ceux marqués comme IMPORTANT)
    const todoRegex = /^\s*\/\/\s*(TODO|FIXME|HACK|XXX):\s*.*$/gm;
    const todos = content.match(todoRegex);
    if (todos) {
      // Garder seulement les TODO marqués comme IMPORTANT
      const importantTodos = todos.filter(todo => 
        todo.includes('IMPORTANT') || todo.includes('CRITICAL')
      );
      
      if (importantTodos.length !== todos.length) {
        content = content.replace(todoRegex, (match) => {
          if (match.includes('IMPORTANT') || match.includes('CRITICAL')) {
            return match;
          }
          return '';
        });
        todosRemoved += todos.length - importantTodos.length;
        modified = true;
      }
    }
    
    // Supprimer les lignes vides multiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath.replace(__dirname + '/', '')}`);
      filesProcessed++;
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      cleanFile(filePath);
    }
  });
}

// Scanner le dossier src
const srcPath = path.join(__dirname, '..', 'src');
console.log('📁 Scan du dossier src...\n');

scanDirectory(srcPath);

console.log('\n📊 Résumé du nettoyage:');
console.log('========================');
console.log(`📄 Fichiers traités: ${filesProcessed}`);
console.log(`🗑️  console.log supprimés: ${consoleLogsRemoved}`);
console.log(`📝 TODO/FIXME supprimés: ${todosRemoved}`);

if (filesProcessed > 0) {
  console.log('\n✅ Nettoyage terminé avec succès!');
  console.log('🚀 Le code est maintenant prêt pour la production.');
} else {
  console.log('\n✨ Aucun nettoyage nécessaire - le code est déjà propre!');
}

console.log('\n🏁 Nettoyage terminé!');
