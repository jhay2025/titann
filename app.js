// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Clase para manejar la autenticación
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Error en el registro' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Error en el login' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        showLoginForm();
    }

    isAuthenticated() {
        return !!this.token;
    }

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }
}

// Clase para manejar la música
class MusicManager {
    constructor(authManager) {
        this.authManager = authManager;
    }

    async uploadTrack(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/music/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authManager.token}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Error al subir el track' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async getTracks() {
        try {
            const response = await fetch(`${API_BASE_URL}/music/tracks`, {
                headers: this.authManager.getAuthHeaders()
            });

            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data: data.tracks };
            } else {
                return { success: false, error: data.message || 'Error al obtener tracks' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async deleteTrack(trackId) {
        try {
            const response = await fetch(`${API_BASE_URL}/music/tracks/${trackId}`, {
                method: 'DELETE',
                headers: this.authManager.getAuthHeaders()
            });

            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Error al eliminar el track' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }
}

// Instancias globales
const authManager = new AuthManager();
const musicManager = new MusicManager(authManager);

// Funciones de UI
function showLoginForm() {
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadUserTracks();
}

function updateNavbar() {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const registrationBanner = document.getElementById('registration-banner');
    
    if (authManager.isAuthenticated()) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        document.getElementById('user-name').textContent = authManager.user.name;
        if (registrationBanner) {
            registrationBanner.style.display = 'none';
        }
        showDashboard();
    } else {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
        if (registrationBanner) {
            registrationBanner.style.display = 'block';
        }
        showLoginForm();
    }
}

// Event listeners para formularios
document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();

    // Login form
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const result = await authManager.login({ email, password });
        
        if (result.success) {
            updateNavbar();
            showMessage('¡Login exitoso!', 'success');
        } else {
            showMessage(result.error, 'error');
        }
    });

    // Register form
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        const result = await authManager.register({ name, email, password });
        
        if (result.success) {
            updateNavbar();
            showMessage('¡Registro exitoso!', 'success');
        } else {
            showMessage(result.error, 'error');
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        authManager.logout();
        updateNavbar();
        showMessage('Sesión cerrada', 'info');
    });

    // Upload track form
    document.getElementById('upload-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        const fileInput = document.getElementById('track-file');
        const title = document.getElementById('track-title').value;
        const genre = document.getElementById('track-genre').value;
        
        if (fileInput.files.length === 0) {
            showMessage('Por favor selecciona un archivo', 'error');
            return;
        }
        
        formData.append('audioFile', fileInput.files[0]);
        formData.append('title', title);
        formData.append('genre', genre);
        
        const result = await musicManager.uploadTrack(formData);
        
        if (result.success) {
            showMessage('Track subido exitosamente', 'success');
            loadUserTracks();
            document.getElementById('upload-form').reset();
        } else {
            showMessage(result.error, 'error');
        }
    });
});

// Función para cargar tracks del usuario
async function loadUserTracks() {
    const result = await musicManager.getTracks();
    
    if (result.success) {
        displayTracks(result.data);
    } else {
        showMessage(result.error, 'error');
    }
}

// Función para mostrar tracks
function displayTracks(tracks) {
    const tracksContainer = document.getElementById('user-tracks');
    
    if (tracks.length === 0) {
        tracksContainer.innerHTML = '<p class="no-tracks">No tienes tracks subidos aún</p>';
        return;
    }
    
    tracksContainer.innerHTML = tracks.map(track => `
        <div class="track-item">
            <div class="track-info">
                <h3>${track.title}</h3>
                <p>Género: ${track.genre}</p>
                <p>Estado: ${track.status}</p>
                <p>Subido: ${new Date(track.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="track-actions">
                <button onclick="deleteTrack('${track._id}')" class="delete-btn">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Función para eliminar track
async function deleteTrack(trackId) {
    if (confirm('¿Estás seguro de que quieres eliminar este track?')) {
        const result = await musicManager.deleteTrack(trackId);
        
        if (result.success) {
            showMessage('Track eliminado exitosamente', 'success');
            loadUserTracks();
        } else {
            showMessage(result.error, 'error');
        }
    }
}

// Función para mostrar mensajes
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message-container');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Funciones para cambiar entre formularios
function switchToRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function switchToLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

 