// Apuntes.js

// --- SISTEMA GLOBAL DE TEMAS INSTITUCIONALES ---
window.cambiarTemaUaem = function(tema) {
    if (tema === 'oro') {
        document.body.classList.add('tema-oro');
        localStorage.setItem('temaPreferido', 'oro');
    } else {
        document.body.classList.remove('tema-oro');
        localStorage.setItem('temaPreferido', 'potro');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    
    // Aplicación del tema preferido inicial
    if(localStorage.getItem('temaPreferido') === 'oro') {
        document.body.classList.add('tema-oro');
    }

    // Sincronizar barra de servicio en menú superior de forma dinámica (simulación basada en aportes)
    const progresoMenu = document.getElementById('nav-ss-progreso');
    if (progresoMenu) {
        progresoMenu.style.width = "45%"; 
    }

    // Generación dinámica del contenedor de Notificaciones Premium
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);

    const lanzarToast = (mensaje, icono = '✅') => {
        const toast = document.createElement('div');
        toast.className = 'toast-notif';
        toast.innerHTML = `<span>${icono}</span> <span>${mensaje}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3300);
    };

    // Al ingresar, si hay un usuario logueado, le damos la bienvenida con un Toast
    const usuarioLogueado = localStorage.getItem('usuarioActivo');
    if (usuarioLogueado) {
        lanzarToast(`¡Sesión activa como ${usuarioLogueado}!`, '🐴');
        localStorage.removeItem('usuarioActivo'); // Consumimos el estado
    }

    const materialSubido = localStorage.getItem('materialSubido');
    if (materialSubido) {
        lanzarToast('¡Material enviado a revisión! Tus horas se computarán al ser aprobado.', '🚀');
        localStorage.removeItem('materialSubido'); // Limpiamos el estado
    }

    // ==========================================
    // --- LÓGICA DEL BUSCADOR Y FILTROS ---
    // ==========================================
    const buscador = document.getElementById('buscador');
    const tarjetas = document.querySelectorAll('#contenedor-apuntes .tarjeta-apunte');
    const botonesFiltro = document.querySelectorAll('.btn-filtro');
    const selectorSemestre = document.getElementById('filtro-semestre');
    
    let filtroActual = 'todos';
    let textoBuscado = '';
    let filtroFavoritosActivo = false;

    const filtrarContenido = () => {
        const favs = JSON.parse(localStorage.getItem('potroFavoritos')) || [];
        const semestreActivo = selectorSemestre ? selectorSemestre.value : 'todos';

        tarjetas.forEach(tarjeta => {
            const contenidoTarjeta = tarjeta.textContent.toLowerCase();
            const formatoTarjeta = tarjeta.getAttribute('data-formato');
            const sem = tarjeta.getAttribute('data-semestre') || 'todos';
            
            const h3Interno = tarjeta.querySelector('h3');
            const titulo = tarjeta.getAttribute('data-titulo') || (h3Interno ? h3Interno.textContent.trim() : '');

            const coincideTexto = contenidoTarjeta.includes(textoBuscado);
            const coincideFiltro = (filtroActual === 'todos' || filtroActual === 'favoritos' || formatoTarjeta === filtroActual);
            const cumpleSemestre = (semestreActivo === 'todos' || sem === semestreActivo);
            const cumpleFavorito = (!filtroFavoritosActivo || favs.includes(titulo));

            if (coincideTexto && coincideFiltro && cumpleSemestre && cumpleFavorito) {
                tarjeta.style.display = 'flex'; 
            } else {
                tarjeta.style.display = 'none';
            }
        });
    };

    if (buscador) {
        buscador.addEventListener('input', (evento) => {
            textoBuscado = evento.target.value.toLowerCase();
            filtrarContenido();
        });
    }

    if (selectorSemestre) {
        selectorSemestre.addEventListener('change', filtrarContenido);
    }

    if (botonesFiltro) {
        botonesFiltro.forEach(boton => {
            boton.addEventListener('click', (evento) => {
                botonesFiltro.forEach(btn => btn.classList.remove('activo'));
                const botonClicado = evento.target;
                botonClicado.classList.add('activo');
                
                filtroFavoritosActivo = (botonClicado.id === 'filtro-favoritos');
                filtroActual = botonClicado.getAttribute('data-filtro');
                
                filtrarContenido();
                lanzarToast(`Mostrando: ${botonClicado.textContent.split(' ')[0]}`, '🔍');
            });
        });
    }

    // --- INYECCIÓN DINÁMICA DE BOTÓN FAVORITOS EN TARJETAS ---
    const repoApuntes = document.getElementById('contenedor-apuntes');
    if (repoApuntes) {
        let favoritosGuardados = JSON.parse(localStorage.getItem('potroFavoritos')) || [];

        tarjetas.forEach((tarjeta, index) => {
            const h3Interno = tarjeta.querySelector('h3');
            const idUnico = tarjeta.getAttribute('data-titulo') || (h3Interno ? h3Interno.textContent.trim() : `apunte-${index}`);
            
            const btnFav = document.createElement('div');
            btnFav.className = 'btn-favorito';
            btnFav.setAttribute('data-id', idUnico);
            btnFav.innerHTML = '🔖';
            
            if(favoritosGuardados.includes(idUnico)) {
                btnFav.classList.add('guardado');
                btnFav.innerHTML = '⭐';
            }
            
            tarjeta.appendChild(btnFav);

            btnFav.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                favoritosGuardados = JSON.parse(localStorage.getItem('potroFavoritos')) || [];
                
                if (favoritosGuardados.includes(idUnico)) {
                    favoritosGuardados = favoritosGuardados.filter(id => id !== idUnico);
                    btnFav.classList.remove('guardado');
                    btnFav.innerHTML = '🔖';
                    lanzarToast('Removido de tus favoritos.', '🗑️');
                } else {
                    favoritosGuardados.push(idUnico);
                    btnFav.classList.add('guardado');
                    btnFav.innerHTML = '⭐';
                    lanzarToast('¡Guardado en tus favoritos!', '⭐');
                }
                
                localStorage.setItem('potroFavoritos', JSON.stringify(favoritosGuardados));
                if(filtroFavoritosActivo) { filtrarContenido(); }
            });
        });
    }

    // =======================================================
    // --- LÓGICA CORREGIDA PARA CALIFICAR CON ESTRELLAS PRO ---
    // =======================================================
    const gruposDeEstrellas = document.querySelectorAll('.estrellas-interactivas');

    gruposDeEstrellas.forEach(grupo => {
        const estrellas = grupo.querySelectorAll('.estrella');
        
        // Buscamos el h3 más cercano (nombre del autor o apunte) para crear una llave única de guardado
        const tarjetaContenedora = grupo.closest('.tarjeta-apunte');
        const h3Titulo = tarjetaContenedora ? tarjetaContenedora.querySelector('h3') : null;
        const nombreIdentificador = h3Titulo ? h3Titulo.textContent.trim().replace(/\s+/g, '_') : 'anonimo';
        const STORAGE_RATING_KEY = `rating_guardado_${nombreIdentificador}`;

        // Intentamos recuperar una calificación previa del localStorage
        let calificacionGuardada = parseInt(localStorage.getItem(STORAGE_RATING_KEY)) ?? -1;

        // Pintamos el estado guardado al iniciar la interfaz
        if (calificacionGuardada !== -1) {
            estrellas.forEach((e, i) => {
                if (i <= calificacionGuardada) e.classList.add('activa');
                else e.classList.remove('activa');
            });
        }

        estrellas.forEach((estrella, index) => {
            
            // Efecto Visual al pasar el mouse por encima
            estrella.addEventListener('mouseover', () => {
                estrellas.forEach((e, i) => {
                    if (i <= index) e.classList.add('activa');
                    else e.classList.remove('activa');
                });
            });

            // Fijación absoluta y persistente al hacer click
            estrella.addEventListener('click', (evento) => {
                evento.preventDefault();
                evento.stopPropagation(); 
                
                grupo.classList.add('calificado');
                calificacionGuardada = index; 
                
                // Guardamos de forma definitiva en el navegador del usuario
                localStorage.setItem(STORAGE_RATING_KEY, calificacionGuardada);
                
                estrellas.forEach((e, i) => {
                    if (i <= index) e.classList.add('activa');
                    else e.classList.remove('activa');
                });
                
                lanzarToast(`Registraste ${index + 1} estrellas de valoración.`, '⭐');
            });
        });

        // Al retirar el mouse, regresamos al último estado guardado en LocalStorage
        grupo.addEventListener('mouseleave', () => {
            calificacionGuardada = parseInt(localStorage.getItem(STORAGE_RATING_KEY)) ?? -1;
            estrellas.forEach((e, i) => {
                if (i <= calificacionGuardada) e.classList.add('activa');
                else e.classList.remove('activa');
            });
        });
    });

    // ==========================================
    // --- LÓGICA DE VISUALIZACIÓN Y DESCARGA ---
    // ==========================================
    const contenedorApuntes = document.getElementById("contenedor-apuntes");

    if (contenedorApuntes) {
        contenedorApuntes.addEventListener("click", (e) => {
            const botonVer = e.target.closest(".btn-ver");
            const botonDescargar = e.target.closest(".btn-descargar");
            const tarjeta = e.target.closest(".tarjeta-apunte");
            
            if (!tarjeta || (!botonVer && !botonDescargar)) return;

            const rutaArchivo = tarjeta.getAttribute("data-archivo");
            const tituloArchivo = tarjeta.getAttribute("data-titulo");

            if (botonVer) {
                lanzarToast('Abriendo panel del visor...', '👁️');
                window.open(`visor.html?archivo=${encodeURIComponent(rutaArchivo)}&titulo=${encodeURIComponent(tituloArchivo)}`, '_blank');
            }

            if (botonDescargar) {
                lanzarToast('Descarga iniciada con éxito.', '📥');
                const enlaceTemporal = document.createElement("a");
                enlaceTemporal.href = rutaArchivo;
                enlaceTemporal.download = tituloArchivo || "apunte_potroguia";
                document.body.appendChild(enlaceTemporal);
                enlaceTemporal.click();
                document.body.removeChild(enlaceTemporal);
            }
        });
    }
});