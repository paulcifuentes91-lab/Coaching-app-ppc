// Script para integrar en los planes - Bloquea sesiones completadas

const BloqueoSesiones = {
    
    // Marcar sesión como completada
    completarSesion: async (athleteId, sessionNumber, type = 'training') => {
        try {
            const db = firebase.firestore();
            
            await db.collection('athletes').doc(athleteId).collection('sesiones').doc(`sesion-${sessionNumber}`).set({
                sessionNumber: sessionNumber,
                type: type, // 'training' o 'nutrition'
                completedAt: new Date(),
                locked: true,
                canEdit: false
            }, { merge: true });
            
            console.log(`✅ Sesión ${sessionNumber} completada y bloqueada`);
        } catch (error) {
            console.error('Error:', error);
        }
    },

    // Verificar si sesión está bloqueada
    isSesionLocked: async (athleteId, sessionNumber) => {
        try {
            const db = firebase.firestore();
            
            const sesionDoc = await db.collection('athletes').doc(athleteId)
                .collection('sesiones').doc(`sesion-${sessionNumber}`).get();
            
            if (sesionDoc.exists) {
                return sesionDoc.data().locked || false;
            }
            return false;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    },

    // Obtener sesiones completadas
    getSesionesCompletadas: async (athleteId) => {
        try {
            const db = firebase.firestore();
            
            const snapshot = await db.collection('athletes').doc(athleteId)
                .collection('sesiones').where('locked', '==', true).get();
            
            const completadas = [];
            snapshot.forEach(doc => {
                completadas.push(doc.data().sessionNumber);
            });
            
            return completadas;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },

    // Bloquear elemento HTML si sesión está completada
    lockElementIfCompleted: async (athleteId, sessionNumber, elementId) => {
        const isLocked = await BloqueoSesiones.isSesionLocked(athleteId, sessionNumber);
        
        if (isLocked) {
            const element = document.getElementById(elementId);
            if (element) {
                element.disabled = true;
                element.style.opacity = '0.5';
                element.style.pointerEvents = 'none';
                element.style.backgroundColor = '#2E333A';
                
                // Agregar indicador visual
                const badge = document.createElement('div');
                badge.innerHTML = '🔒 Completado';
                badge.style.fontSize = '0.7rem';
                badge.style.color = '#4caf50';
                badge.style.marginTop = '5px';
                badge.style.fontWeight = '600';
                element.parentElement.appendChild(badge);
            }
        }
    },

    // Desbloquear sesión (solo admin)
    unlockSesion: async (athleteId, sessionNumber, adminPassword) => {
        const correctPassword = 'PPC2026Admin'; // Cambiar en producción
        
        if (adminPassword !== correctPassword) {
            console.error('❌ Contraseña incorrecta');
            return false;
        }

        try {
            const db = firebase.firestore();
            
            await db.collection('athletes').doc(athleteId)
                .collection('sesiones').doc(`sesion-${sessionNumber}`).update({
                locked: false,
                canEdit: true,
                unlockedAt: new Date()
            });
            
            console.log(`✅ Sesión ${sessionNumber} desbloqueada`);
            return true;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }
};

// EXPORTAR para usar en planes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BloqueoSesiones;
}
