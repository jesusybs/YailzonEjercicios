// Config del Intersection Observer, define cuando se dispara la animacion al hacer scroll
const observerOptions = {
    threshold: 0.2,                 // se activa cuando ~20% del elemento es visible
    rootMargin: '0px 0px -100px 0px' // ajusta un poco el area de disparo hacia arriba
};

// Observer que agrega la clase "visible" cuando el elemento entra en pantalla
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // aqui el CSS ya se encarga de animar
        }
    });
}, observerOptions);

// Conectamos el observer con todos los elementos que tienen animacion al hacer scroll
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Efecto ripple para los botones con clase .btn-ripple
document.querySelectorAll('.btn-ripple').forEach(button => {
    button.addEventListener('click', function(e) {
        // calculo rapido para centrar el efecto segun donde clickea el usuario
        const ripple = this.querySelector('::before') || document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        // aplicamos tamaño y posicion al ripple usando estilos inline
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
    });
});
