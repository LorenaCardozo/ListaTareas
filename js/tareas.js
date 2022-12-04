const lista = document.getElementById("lista-tarea");
const btnAgregar = document.getElementById("btnAgregar");
const tarea = document.getElementById("input-tarea");
const laHora = document.getElementById("div-hora");
const elDia = document.getElementById("div-dia");
const sugerencia = document.getElementById("div-sugerido");
const checks_agregar = document.querySelectorAll('check-agregar');
const menu = document.getElementById("menu-sugerido");
const tiempo = document.getElementById("div-tiempo");

const check = "bi-check-circle";
const uncheck = "bi-circle";
const lineThrough = "line-through";
const up = "bi-caret-up-square-fill";
const down = "bi-caret-down-square-fill";

let id = 0;
const listaSugerido = [];

const LONG_DEFAULT = -119.4179;
const LATIT_DEFAULT = 36.7783;

array_dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
array_meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

let latitud, longitud;

const API_KEY = "883d4368e97c1b6d0633c88a967e00aa";

/*URL PARA CONSUMIR API CON LATITUD Y LONGITUD POR DEFECTO*/
let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${LATIT_DEFAULT}&lon=${LONG_DEFAULT}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`

let ListaTareas = [];

/*************************************************************/

// OBJETO - METODO
function Tarea(tarea, id, completada) {
    this.id = id;
    this.tarea = tarea;
    this.completada = completada;

    this.completar = (valor)=>{ this.completada = valor }
}

/************************************************************/

// HORA ACTUAL

setInterval(() => {
    const fecha = new Date();
    const mes = fecha.getMonth();
    const dia = fecha.getDate();
    const dia_semana = fecha.getDay();

    const hora = fecha.getHours();
    const horaEn12HrFormat = hora >= 13 ? hora % 12 : hora
    const minutos = fecha.getMinutes();
    const ampm = hora >= 12 ? 'PM' : 'AM'

    laHora.innerHTML = (horaEn12HrFormat < 10 ? '0' + horaEn12HrFormat : horaEn12HrFormat) + ':' + (minutos < 10 ? '0' + minutos : minutos) + ' ' + `<span id="am-pm">${ampm}</span>`

    elDia.innerHTML = array_dias[dia_semana] + ', ' + dia + ' ' + array_meses[mes]

}, 1000);


/***********************************************************/

/* CONSULTA API SOBRE EL ESTADO DEL TIEMPO */

async function cargarTiempo(url) {

    await fetch(url)
        .then((resp) => resp.json())
        .then((data) => {

            let temp = `
                    <p>${data.timezone}</p>
                    <div class= "div-dato-tiempo">
                    <img src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                    <span class = "div-temperatura">${data.current.temp}°</span>
                    </div>`;

            tiempo.innerHTML = temp;
        })

}

cargarTiempo(url);


/**************************************************/

/* CONSUME DE API EL ESTADO DEL TIEMPO LOCAL*/

function ConsumirAPITiempoLocal(url) {

    navigator.geolocation.getCurrentPosition((sucess) => {
        latitud = sucess.coords.latitude; longitud = sucess.coords.longitude

        if (latitud && longitud) {
            url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitud}&lon=${longitud}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`
        }

        cargarTiempo(url);

    })


}

ConsumirAPITiempoLocal(url);


/****************  LOCAL STORAGE*********************** */
// se consulta de local storage y se cargan las tareas

let datos = localStorage.getItem("LISTA-TAREA")  /*recupero los datos de localStorage*/
if (datos) {
    lista.innerHTML = "";
    datosJson = JSON.parse(datos); /*como getItem devuelve un string, lo paso a Array con el parse.*/
    id = 0;
    datosJson.forEach(elem => {

        elem.id = id;
        agregarTarea(elem.tarea, id, elem.completada)
        ListaTareas.push(new Tarea(elem.tarea, id, elem.completada));        
        id++;

    })

    localStorage.setItem("LISTA-TAREA", JSON.stringify(datosJson));

}
;

/***************  AGREGAR TAREA ************************ */

/*EVENTO CLICK SOBRE EL BOTON Agregar*/

btnAgregar.addEventListener('click', agregar)

function agregar() {
    if (tarea.value.trim() !== "") {

        if (!ExisteTarea(tarea.value)) {
            console.log(ListaTareas.indexOf(tarea.value.trim()))
            agregarTarea(tarea.value, id, false);
            ListaTareas.push(new Tarea(tarea.value, id, false));
            localStorage.setItem("LISTA-TAREA", JSON.stringify(ListaTareas));
            tarea.value = "";
            id++;

            console.log(ListaTareas)
        }
        else {
            swal("Tarea no válida!", "La tarea ya existe en la lista", "error");
        }
    }
    else {
        swal("Tarea no válida!", "la tarea no puede esta vacía!", "error");
    }

}

function agregarTarea(tareaDeta, id, completada) {

    const TareaCompleta = completada ? check : uncheck;
    const Line = completada ? lineThrough : "";
    const EsCompleta = completada ? "completa" : "";

    const nuevaTarea = `<li class= "li-tarea  ${EsCompleta}">
                        <i class="bi ${TareaCompleta}" data="completada" id=${id}></i>
                        <p class="text ${Line}">${tareaDeta}</p>
                        <i class="bi bi-trash" data="eliminada" id = ${id}></i>                         
                        </li> `
    lista.insertAdjacentHTML("beforeend", nuevaTarea);

}

/*EVENTO KEYUP SOBRE EL ENTER*/
document.addEventListener('keyup', (e) => {
    if (e.key == 'Enter') {
        agregar();
    }
})


/******************************************************/


/*************CUMPLIR/ELIMINAR TAREA**************** */

const todoCompleto = ()=>{
    return new Promise((resolve, reject) => {
        let pendientes = ListaTareas.find((e)=> e.completada == false);

        resolve(pendientes);
    })
}

const completarTarea = (element) =>{

    return new Promise((resolve, reject) =>{
        let indice = ListaTareas.map(t => t.id.toString()).indexOf(element.id.toString())
        let valor = ListaTareas[indice].completada ? false : true
        
        ListaTareas[indice].completar(valor);
    
        localStorage.setItem("LISTA-TAREA", JSON.stringify(ListaTareas));

        resolve(true)
    });
    
}


function tareaCompletada(element) {
    element.classList.toggle(check); /*toggle agrega o elimina la clase si ya existia*/
    element.classList.toggle(uncheck);
    element.parentNode.querySelector(".text").classList.toggle(lineThrough);
    element.parentNode.classList.toggle("completa");

    completarTarea(element)
    .then(
    todoCompleto(element)
        .then((p) => {
                if (p === undefined)
                {
                    console.log(p);
                    swal("Buen trabajo! cumpliste con todas tus metas del dìa!", {
                        title: "Felicitaciones!!!",
                        icon: "success",
                    });
                }
                })
    )
}

function tareaEliminada(element) {
    element.parentNode.parentNode.removeChild(element.parentNode);

    ListaTareas = ListaTareas.filter((t) => t.id != element.id);

    localStorage.setItem("LISTA-TAREA", JSON.stringify(ListaTareas));
}


lista.addEventListener('click', (e) => {

    if (e.target.nodeName != "I") {return}

    const element = e.target;
    const elementData = element.attributes.data.value;

    if (elementData == "completada") {
        tareaCompletada(element)
    }
    else
        if ((elementData == "eliminada")) {

            swal({
                title: "¿Estás seguro de eliminar esta tarea?",
                text: "una vez eliminada, no podrá recuperarse!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
                        console.log(element);
                        tareaEliminada(element)
                        swal("La tarea ha sido eliminada correctamente", {
                            title: "Borrado",
                            icon: "success",
                        });
                    } else {
                        swal("La tarea no se ha eliminado.");
                    }
                });

        }


})


/***********************************************************************/
/* SE CONSULTA EL ARCHIVO JSON CON LAS TAREAS SUGERIDAS PARA MOSTRARLAS USANDO DOM*/

async function CargarSugeridas() {

    await fetch('./data/tareasugeridas.json')
        .then((resp) => resp.json())
        .then((data) => {

            data.forEach((e, index) => {
                const sugerido = `<div class="div-tarea-sugerido">
                                    <i class="bi bi-plus-square check-agregar" id= ${index} ></i>
                                    <p class="text">${e.tarea}</p>
                                    </div> `
                listaSugerido.push(e.tarea);
                //console.log(sugerencia);

                sugerencia.insertAdjacentHTML("beforeend", sugerido);

            })

        })


}

function ExisteTarea(textoTarea) {

    let tareaExiste = ListaTareas.find((e) => e.tarea.toUpperCase() === textoTarea.toUpperCase())

    return tareaExiste

}

CargarSugeridas();


window.setTimeout(() => {

    document.querySelectorAll('.check-agregar').forEach(item => {
        item.addEventListener('click', event => {
            if (!ExisteTarea(listaSugerido[event.target.id])) {
                agregarTarea(listaSugerido[event.target.id], event.target.id, false)
                ListaTareas.push(new Tarea(listaSugerido[event.target.id], id, false));
                localStorage.setItem("LISTA-TAREA", JSON.stringify(ListaTareas));
                id++
            }
            else {
                swal("Ya está en la lista!", "La tarea ya existe en tu lista de tareas", "error");
            }
        })
    })
    return
}
    , 1000)


/*********************************************************/
/*EVENTO CLICK PARA DESPLEGAR LAS TAREAS SUGERIDAS*/ 

menu.addEventListener('click', mostrarSugerido)

function mostrarSugerido(){
    sugerencia.classList.toggle("oculto");    
    menu.classList.toggle(down);    
    menu.classList.toggle(up);
}
