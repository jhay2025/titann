// Firebase Client Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    addDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "tu_firebase_api_key",
    authDomain: "tu_proyecto.firebaseapp.com",
    projectId: "tu_proyecto_id",
    storageBucket: "tu_proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Usuario autenticado:', user.email);
        // Update UI for logged in user
        updateUIForLoggedInUser(user);
    } else {
        console.log('Usuario no autenticado');
        // Update UI for logged out user
        updateUIForLoggedOutUser();
    }
});

// UI Update Functions
function updateUIForLoggedInUser(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const userInfo = document.querySelector('.user-info');
    
    if (authButtons && userInfo) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        
        const userNameSpan = userInfo.querySelector('span');
        if (userNameSpan) {
            userNameSpan.textContent = user.displayName || user.email;
        }
    }
}

function updateUIForLoggedOutUser() {
    const authButtons = document.querySelector('.auth-buttons');
    const userInfo = document.querySelector('.user-info');
    
    if (authButtons && userInfo) {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

// Auth Functions
window.firebaseAuth = {
    // Register user
    async register(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update profile
            await updateProfile(user, { displayName });
            
            // Create user document in Firestore
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                role: 'user',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                profile: {
                    bio: '',
                    avatar: '',
                    socialLinks: {}
                },
                subscription: {
                    plan: 'free',
                    status: 'active',
                    startDate: serverTimestamp(),
                    endDate: null
                }
            };
            
            await setDoc(doc(db, 'users', user.uid), userData);
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName
                }
            };
        } catch (error) {
            console.error('Error en registro:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Login user
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                }
            };
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Logout user
    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Error en logout:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Reset password
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Error en reset password:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Get current user
    getCurrentUser() {
        return auth.currentUser;
    }
};

// Music Functions
window.firebaseMusic = {
    // Upload track
    async uploadTrack(trackData, audioFile, coverFile = null) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Upload audio file
            const audioRef = ref(storage, `tracks/${user.uid}/${Date.now()}_${audioFile.name}`);
            const audioSnapshot = await uploadBytes(audioRef, audioFile);
            const audioUrl = await getDownloadURL(audioSnapshot.ref);

            let coverUrl = '';
            if (coverFile) {
                const coverRef = ref(storage, `covers/${user.uid}/${Date.now()}_${coverFile.name}`);
                const coverSnapshot = await uploadBytes(coverRef, coverFile);
                coverUrl = await getDownloadURL(coverSnapshot.ref);
            }

            // Create track document
            const trackDoc = {
                ...trackData,
                audioUrl,
                coverUrl,
                uploaderId: user.uid,
                uploaderEmail: user.email,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                stats: {
                    plays: 0,
                    downloads: 0,
                    likes: 0,
                    shares: 0
                },
                status: 'active'
            };

            const docRef = await addDoc(collection(db, 'tracks'), trackDoc);
            
            return {
                success: true,
                trackId: docRef.id,
                track: { ...trackDoc, id: docRef.id }
            };
        } catch (error) {
            console.error('Error subiendo track:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Get public tracks
    async getTracks(options = {}) {
        try {
            const { page = 1, limit = 10, genre, search } = options;
            
            let tracksQuery = query(
                collection(db, 'tracks'),
                where('isPublic', '==', true),
                where('status', '==', 'active'),
                orderBy('createdAt', 'desc')
            );

            if (genre) {
                tracksQuery = query(tracksQuery, where('genre', '==', genre));
            }

            const tracksSnapshot = await getDocs(tracksQuery);
            const tracks = [];

            tracksSnapshot.forEach(doc => {
                const track = doc.data();
                track.id = doc.id;
                
                if (!search || 
                    track.title.toLowerCase().includes(search.toLowerCase()) ||
                    track.artist.toLowerCase().includes(search.toLowerCase())) {
                    tracks.push(track);
                }
            });

            const offset = (page - 1) * limit;
            const paginatedTracks = tracks.slice(offset, offset + limit);

            return {
                success: true,
                tracks: paginatedTracks,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: tracks.length,
                    totalPages: Math.ceil(tracks.length / limit)
                }
            };
        } catch (error) {
            console.error('Error obteniendo tracks:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Get user tracks
    async getUserTracks() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const tracksQuery = query(
                collection(db, 'tracks'),
                where('uploaderId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const tracksSnapshot = await getDocs(tracksQuery);
            const tracks = [];

            tracksSnapshot.forEach(doc => {
                const track = doc.data();
                track.id = doc.id;
                tracks.push(track);
            });

            return {
                success: true,
                tracks
            };
        } catch (error) {
            console.error('Error obteniendo tracks del usuario:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Get track by ID
    async getTrack(id) {
        try {
            const trackDoc = await getDoc(doc(db, 'tracks', id));
            
            if (!trackDoc.exists()) {
                throw new Error('Track no encontrado');
            }

            const track = trackDoc.data();
            track.id = trackDoc.id;

            return {
                success: true,
                track
            };
        } catch (error) {
            console.error('Error obteniendo track:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Update track
    async updateTrack(id, updateData) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const trackDoc = await getDoc(doc(db, 'tracks', id));
            
            if (!trackDoc.exists()) {
                throw new Error('Track no encontrado');
            }

            const track = trackDoc.data();
            
            if (track.uploaderId !== user.uid) {
                throw new Error('No tienes permisos para editar este track');
            }

            await updateDoc(doc(db, 'tracks', id), {
                ...updateData,
                updatedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error actualizando track:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Delete track
    async deleteTrack(id) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const trackDoc = await getDoc(doc(db, 'tracks', id));
            
            if (!trackDoc.exists()) {
                throw new Error('Track no encontrado');
            }

            const track = trackDoc.data();
            
            if (track.uploaderId !== user.uid) {
                throw new Error('No tienes permisos para eliminar este track');
            }

            // Delete files from storage
            if (track.audioUrl) {
                const audioRef = ref(storage, track.audioUrl);
                await deleteObject(audioRef);
            }

            if (track.coverUrl) {
                const coverRef = ref(storage, track.coverUrl);
                await deleteObject(coverRef);
            }

            // Delete document
            await deleteDoc(doc(db, 'tracks', id));

            return { success: true };
        } catch (error) {
            console.error('Error eliminando track:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
};

console.log('🔥 Firebase Client configurado'); 