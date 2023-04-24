"use strict"

AOS.init();

// *** TICKETS Y PELICULAS
let peliculas = [];
let tickets = [];

class Entrada {
    constructor(fila, asiento, valor, pelicula, usuario, comprado) {
        this.fila = fila;
        this.asiento = asiento;
        this.valor = valor;
        this.pelicula = pelicula;
        this.usuario = usuario;
        this.comprado = comprado;
        this.idTicket = idPelicula + fila + asiento;
    }
}



// *** FETCH DE CARTELERA
crearCartelera();
async function crearCartelera() {
    const pelisJson ="peliculas.json"
    const respuesta =await fetch(pelisJson)
    const datos = await respuesta.json()
    peliculas = datos;
    renderCartelera();
}



// *** FUNCION RENDER CARTELERA
let cartas = document.getElementById("cartas");
let cantidad = 0;
async function renderCartelera() {
    for (const pelicula of peliculas) {
        let carta = document.createElement("div");
        carta.innerHTML = `
            <div class="col">
                <div id="carta${pelicula.id}" class="card mb-4 rounded-3 shadow-sm">
                <img src="${pelicula.urlImagen}" class="card-img-top">
                    <div class="card-header py-6">
                        <h4 class="my-0 fw-normal">${pelicula.titulo}</h4>
                    </div>
                    <div class="card-body">
                        <h2 class="fw-light">$${pelicula.precio}</small></h1>
                        <ul class="list-unstyled mt-3 mb-4">
                            <li>Género: ${pelicula.genero}</li>
                            <li>Duración: ${pelicula.duracion}</li>
                        </ul>
                        <div class="input-group mb-3">
                            <button type="button" class="btn btn-md btn-primary" id="btn${pelicula.id}">Agregar</button>
                            <select class="form-select" id="selector" aria-label="Cantidad de entradas">
                                <option selected>Entradas (cantidad)</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>`;
        cartas.append(carta); 

        document.getElementById(`btn${pelicula.id}`).addEventListener('click', function() {
          iniciarCompra(pelicula.id);
        })
        let opciones = document.getElementsByClassName("form-select")
        opciones[`${pelicula.id}`].onchange = () => {
            cantidad = opciones[`${pelicula.id}`].options[opciones[`${pelicula.id}`].selectedIndex].value;
        }
    }
    return cantidad
}
renderCartelera();



// *** DARK MODE HTML
let etiqueta = document.getElementById("label")
let modo;
async function darkMode() {
    document.body.className = "dark";
    etiqueta.innerText = "Light";
    document.getElementById("titulo").style.color = "white";
    document.getElementById("saludoUsuario").className = "btn btn-link py-2 text-light text-decoration-none"
    document.getElementById("cartas").style.color = "black";
    peliculas.forEach((pelicula) => {document.getElementById(`carta${pelicula.id}`).className = "card mb-4 rounded-3 shadow-s text-bg-secondary"});
    document.getElementById("tabla").className = "table table-dark table-hover";
    modo = "dark";
}
async function lightMode() {
    document.body.className = "light";
    etiqueta.innerText = "Dark";
    document.getElementById("titulo").style.color = "black";
    document.getElementById("saludoUsuario").className = "btn btn-link py-2 text-dark text-decoration-none"
    peliculas.forEach((pelicula) => {document.getElementById(`carta${pelicula.id}`).className = "card mb-4 rounded-3 shadow-s"});
    document.getElementById("tabla").className = "table table-hover";
    modo = "light";
}
// *** DEFAULT STORAGE MODE
localStorage.getItem("Modo") == "dark" ? darkMode() : lightMode();
// *** STORAGE MODE
localStorage.setItem("Modo", modo);
// *** ACCION BOTON MODE
let botonModo = document.getElementById("mode");
botonModo.onclick = () => {
    modo == "light" ? darkMode() : lightMode();
    localStorage.setItem("Modo", modo);
}



// *** BOTON "¡HOLA!"
let botonUsuario = document.getElementById("saludoUsuario");
botonUsuario.addEventListener('click', saludarUsuario);
let nombre;
async function saludarUsuario() {
    Swal.fire({
        input: 'text',
        inputPlaceholder: 'Ingresa tu nombre',
        showCancelButton: true,
    })
    .then(resultado =>{
        if (resultado.value == "" || resultado.value == null || !isNaN(resultado.value)) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            })
            Toast.fire({
                icon: 'error',
                title: 'Por favor, ingresá correctamente tu nombre'
            })
        } else {
            nombre = resultado.value
            localStorage.setItem("Nombre", nombre);
            botonUsuario.style.font = "bold";
            botonUsuario.innerHTML = `Hola ${nombre}, ¿cómo estás?`;
            traerTicketera(nombre);
        }
    })
}



// *** FUNCION TRAER TICKETERA DEL USUARIO
let totalTicketera = 0;
let tablaBody = document.getElementById("tablabody");
let tablaHead = document.getElementById("tablahead");
let botonFinalizar = document.getElementById("boton-finalizar");
async function traerTicketera(nombre) {
    if (localStorage.getItem("Tickets")) {
        tickets = JSON.parse(localStorage.getItem("Tickets"));
        tablaHead.innerHTML = ""
        tablaBody.innerHTML = ""
        totalTicketera = 0;
        tablaHead.innerHTML = `
            <tr>
                <th scope="col">Pelicula</th>
                <th scope="col">Fila</th>
                <th scope="col">Asiento</th>
                <th scope="col">Precio</th>
                <th scope="col">Eliminar Ticket</th>
            </tr>
            `
        for (const ticket of tickets) {
            if (ticket.usuario == nombre && ticket.comprado == false) {
                tablaBody.innerHTML += `
                <tr>
                    <td>${ticket.pelicula}</td>
                    <td>${ticket.fila}</td>
                    <td>${ticket.asiento}</td>
                    <td>${ticket.valor}</td>
                    <td><button class="btn btn-link py-2 text-dark text-decoration-none" onclick="eliminar('${ticket.idTicket}')">🗑️</button></td>
                </tr>
                `
                totalTicketera += ticket.valor
            }
        }
        if (totalTicketera != 0) {
            tablaBody.innerHTML += `
            <tr>
                <td></td>
                <td></td>
                <td>TOTAL COMPRA</td>
                <td><span style="font-weight:bold">$ ${totalTicketera}</span></td>
            </tr>
            `
            botonFinalizar.innerHTML = `
            <br>
            <button type="button" class="btn btn-dark">Finalizar Compra</button>
            <br>
            `
        } else {
            botonFinalizar.innerHTML = "";
        }
    }
}



// *** FUNCION ELIMINAR DE TICKETERA
async function eliminar(id){
    tickets = JSON.parse(localStorage.getItem("Tickets"))
    let indice = tickets.findIndex((ticket) => ticket.idTicket == id);
    tickets.splice(indice, 1);
    localStorage.setItem("Tickets", JSON.stringify(tickets));
    traerTicketera(nombre);
}



// *** FUNCION COMPRAR
let tituloPelicula = "";
let precioPelicula = 0;
let idPelicula;
async function iniciarCompra (peliculaElegida) {
    if (nombre == "" || nombre == undefined) {
        Swal.fire({
            text: 'Para poder comprar, primero tenés que iniciar sesión haciendo click en "¡HOLA!"',
        })
    } else {
        for (const pelicula of peliculas) {
            if(peliculas.indexOf(pelicula) == peliculaElegida) {
            tituloPelicula = pelicula.titulo;
            precioPelicula = pelicula.precio;
            idPelicula = pelicula.id
            } 
        }
        await cantidadEntradas();
        await traerTicketera(nombre);
        cartas.innerHTML = "";
        await renderCartelera();
    }
}

let fila;
let asiento;
async function cantidadEntradas() {
    if (isNaN(cantidad) || (cantidad == 0)) {
        Swal.fire({
            text: `${nombre}, indica cuántas entradas querés y volvé a iniciar la compra`,
        })
    } else {
        for(cantidad; cantidad >= 1; cantidad--) {
            await filaEntrada();
            await asientoEntrada();
            let ticket = new Entrada (fila, asiento, precioPelicula, tituloPelicula, nombre, false, idPelicula+fila+asiento)
            tickets.push(ticket);
        }
        const ticketsUsuario = tickets.filter((ticket) => ticket.usuario == nombre);
        let precioTotal = 0;
        ticketsUsuario.forEach((ticket)=> {precioTotal += ticket.valor})


        console.table(ticketsUsuario);
        console.log(`${nombre}, el total a pagar es de $${precioTotal}`);
        localStorage.setItem("Tickets", JSON.stringify(tickets));
        Swal.fire({
            icon: 'success',
            title: `Buenísimo ${nombre}!`,
            text: `El total a pagar es de $${precioTotal}`
        })
    }
}

async function filaEntrada() {
    await Swal.fire({
        title: 'Elegí una fila',
        input: 'select',
        inputPlaceholder: 'Fila',
        showCancelButton: true,
        width: '20em',
        inputOptions: {
            A: 'A',
            B: 'B',
            C: 'C',
            D: 'D',
            E: 'E',
            F: 'F',
            G: 'G',
            H: 'H',
            I: 'I',
            J: 'J'
        },
        inputValidator: (valor) => {
            if (!valor || valor == "Fila" || valor == undefined) {
                return 'Por favor, elegí una de las filas disponibles'
            } 
        }
    })
    .then(resultado =>{
        fila = resultado.value;
    })
}

async function asientoEntrada() {
    await Swal.fire({
        title: 'Elegí un asiento del 1 al 15',
        input: 'text',
        inputPlaceholder: 'Asiento (sólo números)',
        showCancelButton: true,
        width: '20em',
        inputValidator: (valor) => {
            if (!valor || isNaN(valor) || valor > 15 || valor == 0 || valor == undefined) {
                return 'Por favor, elegí uno de los asientos disponibles'
            } else if (Boolean(tickets.some((ticket) => ticket.fila + ticket.asiento + ticket.pelicula == fila + valor + tituloPelicula))) {
                return 'Esta ubicación ya está ocupada, por favor elegir otra'
            }
        }
    })
    .then(resultado =>{
        asiento = resultado.value;
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        Toast.fire({
            icon: 'success',
            title: `Elegiste ${fila}${asiento}\nTe quedan ${cantidad-1} entradas para elegir`
        })
    })
}



// *** FUNCION FINALIZAR LA COMPRA
botonFinalizar.addEventListener('click', async function() {
    Swal.fire({
        title: "Gracias por tu compra!",
        text: "Ya podés retirar tus entradas y pagar en boletería",
        imageUrl: "https://thumbs.dreamstime.com/b/congrats-confetti-colored-text-76321031.jpg",
        imageWidth: 400,
        imageHeight: 173,
        imageAlt: "BUENA COMPRA!",
    });
    for (const ticket of tickets) {
        if (ticket.usuario == nombre) {
            ticket.comprado = true;
        }
    }
    localStorage.setItem("Tickets", JSON.stringify(tickets));
    traerTicketera(nombre);
})
