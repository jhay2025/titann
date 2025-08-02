// Test script para verificar la configuración de Firebase
require('dotenv').config({ path: './config.env' });

console.log('🧪 Probando configuración de Firebase...\n');

// Importar configuración
const { 
    isConfigured, 
    isAdminConfigured, 
    checkFirebaseConfig, 
    checkAdminConfig 
} = require('./firebase-config');

console.log('📋 Estado de la configuración:');
console.log(`✅ Firebase Web App: ${isConfigured ? 'Configurado' : 'No configurado'}`);
console.log(`✅ Firebase Admin SDK: ${isAdminConfigured ? 'Configurado' : 'No configurado'}`);

// Verificar variables de entorno
console.log('\n🔧 Variables de entorno:');
const requiredVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
];

const adminVars = [
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_X509_CERT_URL'
];

console.log('\n📱 Firebase Web App:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value ? 'Configurado' : 'Faltante'}`);
});

console.log('\n🔐 Firebase Admin SDK:');
adminVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value ? 'Configurado' : 'Faltante'}`);
});

// Probar funciones de verificación
console.log('\n🧪 Probando funciones de verificación:');

try {
    checkFirebaseConfig();
    console.log('✅ Firebase Web App: Funcionando correctamente');
} catch (error) {
    console.log('❌ Firebase Web App:', error.message);
}

try {
    checkAdminConfig();
    console.log('✅ Firebase Admin SDK: Funcionando correctamente');
} catch (error) {
    console.log('❌ Firebase Admin SDK:', error.message);
}

console.log('\n📝 Resumen:');
if (isConfigured && isAdminConfigured) {
    console.log('🎉 ¡Todo está configurado correctamente!');
    console.log('🚀 Puedes ejecutar el servidor con: npm run dev');
} else if (isConfigured) {
    console.log('⚠️ Firebase Web App está configurado, pero Admin SDK no');
    console.log('📖 Revisa las variables de entorno del Admin SDK');
} else {
    console.log('❌ Firebase no está configurado correctamente');
    console.log('📖 Sigue las instrucciones en FIREBASE_SETUP.md');
}

console.log('\n💡 Consejos:');
console.log('1. Verifica que todas las variables de entorno estén en config.env');
console.log('2. Asegúrate de que el proyecto de Firebase esté creado');
console.log('3. Verifica que Authentication, Firestore y Storage estén habilitados');
console.log('4. Revisa las reglas de seguridad en Firebase Console'); 