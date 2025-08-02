# 🔥 Configuración de Firebase para Titan Golden Music

## 📋 Pasos para configurar Firebase

### 1. Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear proyecto"
3. Nombra tu proyecto (ej: `titan-golden-music`)
4. Habilita Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

### 2. Configurar Authentication

1. En el panel de Firebase, ve a "Authentication"
2. Haz clic en "Comenzar"
3. En la pestaña "Sign-in method", habilita:
   - **Email/Password**
   - **Google** (opcional)
4. Guarda los cambios

### 3. Configurar Firestore Database

1. Ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba"
4. Elige una ubicación cercana (ej: `us-central1`)
5. Haz clic en "Listo"

### 4. Configurar Storage

1. Ve a "Storage"
2. Haz clic en "Comenzar"
3. Selecciona "Comenzar en modo de prueba"
4. Elige la misma ubicación que Firestore
5. Haz clic en "Listo"

### 5. Obtener configuración del proyecto

1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. En la pestaña "General", desplázate hacia abajo
3. En "Tus apps", haz clic en el ícono de web (</>)
4. Registra tu app con un nombre (ej: `titan-golden-music-web`)
5. Copia la configuración que aparece

### 6. Configurar Service Account (para el backend)

1. Ve a "Configuración del proyecto" > "Cuentas de servicio"
2. Haz clic en "Generar nueva clave privada"
3. Descarga el archivo JSON
4. **IMPORTANTE**: Guarda este archivo de forma segura

### 7. Actualizar archivos de configuración

#### Actualizar `config.env`:

```env
# Firebase Configuration
FIREBASE_API_KEY=tu_api_key_real
FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Admin SDK (Service Account)
FIREBASE_PRIVATE_KEY_ID=tu_private_key_id_real
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu_private_key_real_aqui\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu_proyecto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40tu_proyecto.iam.gserviceaccount.com
```

#### Actualizar `firebase-client.js`:

```javascript
const firebaseConfig = {
    apiKey: "tu_api_key_real",
    authDomain: "tu_proyecto.firebaseapp.com",
    projectId: "tu_proyecto_id",
    storageBucket: "tu_proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### 8. Configurar reglas de Firestore

En Firebase Console > Firestore Database > Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tracks públicos pueden ser leídos por cualquiera
    // Solo el propietario puede escribir
    match /tracks/{trackId} {
      allow read: if resource.data.isPublic == true;
      allow write: if request.auth != null && request.auth.uid == resource.data.uploaderId;
    }
  }
}
```

### 9. Configurar reglas de Storage

En Firebase Console > Storage > Reglas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Usuarios pueden subir archivos a sus carpetas
    match /tracks/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /covers/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 10. Instalar dependencias

```bash
npm install
```

### 11. Ejecutar el proyecto

```bash
npm run dev
```

## 🔧 Estructura de datos en Firestore

### Colección: `users`
```javascript
{
  uid: "string",
  email: "string",
  displayName: "string",
  role: "user" | "admin",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  profile: {
    bio: "string",
    avatar: "string",
    socialLinks: {}
  },
  subscription: {
    plan: "free" | "premium",
    status: "active" | "inactive",
    startDate: "timestamp",
    endDate: "timestamp"
  }
}
```

### Colección: `tracks`
```javascript
{
  title: "string",
  artist: "string",
  genre: "string",
  description: "string",
  price: "number",
  isPublic: "boolean",
  audioUrl: "string",
  coverUrl: "string",
  uploaderId: "string",
  uploaderEmail: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  stats: {
    plays: "number",
    downloads: "number",
    likes: "number",
    shares: "number"
  },
  status: "active" | "inactive"
}
```

## 🚀 Funcionalidades implementadas

### ✅ Autenticación
- Registro de usuarios
- Login/Logout
- Reset de contraseña
- Verificación de tokens

### ✅ Gestión de música
- Subida de tracks
- Subida de covers
- Listado de tracks públicos
- Gestión de tracks del usuario
- Actualización y eliminación

### ✅ Storage
- Almacenamiento de archivos de audio
- Almacenamiento de imágenes de portada
- URLs de descarga seguras

### ✅ Seguridad
- Reglas de Firestore
- Reglas de Storage
- Autenticación JWT
- Validación de permisos

## 🔍 Troubleshooting

### Error: "Firebase not configured"
- Verifica que las variables de entorno estén configuradas
- Asegúrate de que el archivo `config.env` esté en la raíz del proyecto

### Error: "Permission denied"
- Verifica las reglas de Firestore y Storage
- Asegúrate de que el usuario esté autenticado

### Error: "File too large"
- Verifica el límite de tamaño en `config.env`
- Ajusta `MAX_FILE_SIZE` según necesites

## 📞 Soporte

Si tienes problemas con la configuración:
1. Verifica que todos los pasos estén completados
2. Revisa la consola del navegador para errores
3. Verifica los logs del servidor
4. Asegúrate de que las claves de Firebase sean correctas 