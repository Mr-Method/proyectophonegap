
var app = {
    // Application Constructor
    initialize: function() {
        console.log('lgh initialize'); 
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //document.addEventListener('deviceready', init, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        app.openDb();
        app.checkSesion();
        app.getLocation();
        app.seePosition();
        app.mandarJquery();
        
        app.receivedEvent('deviceready');
        var pushNotification = window.plugins.pushNotification;
        pushNotification.register(app.successHandler, app.errorHandler,{"senderID":"466388852109","ecb":"app.onNotificationGCM"});
    
        
        //estas lineas son las que serian la function init del ejemplo sqlite
        //navigator.splashscreen.hide(); la saque porque explota
        //---> base local sqlite
        //app.openDb();
        app.createTable();
        app.refresh();

        //app.checkSesion();
        alert('chequeo: ' + chequeo + ' / app.email: ' + app.email);

        


    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        
    },

    openDb: function() {
        console.log('lgh en openDb');
        if (window.navigator.simulator === true) {
            // For debugin in simulator fallback to native SQL Lite
            console.log("Use built in SQL Lite");
            app.db = window.openDatabase("Todo", "1.0", "Cordova Demo", 200000);
        }
        else {
            app.db = window.sqlitePlugin.openDatabase("Todo");
        }
    },

    createTable: function() {
        var db = app.db;
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on DATETIME)", []);
        });
    },

    addTodo: function(todoText) {
        var db = app.db;
        db.transaction(function(tx) {
            var addedOn = new Date();
            tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)",
                          [todoText, addedOn],
                          app.onSuccess,
                          app.onError);
        });
    },
      
    onError: function(tx, e) {
        console.log("Error: " + e.message);
    },
      
    onSuccess: function(tx, r) {
        app.refresh();
    },
      
    deleteTodo: function(id) {
        var db = app.db;
        db.transaction(function(tx) {
            tx.executeSql("DELETE FROM todo WHERE ID=?", [id],
                          app.onSuccess,
                          app.onError);
        });
    },

    refresh: function() {
        var renderTodo = function (row) {
            return "<li>" + "<div class='todo-check'></div>" + row.todo + "<a class='button delete' href='javascript:void(0);'  onclick='app.deleteTodo(" + row.ID + ");'><p class='todo-delete'></p></a>" + "<div class='clear'></div>" + "</li>";
        }
        
        var render = function (tx, rs) {
            var rowOutput = "";
            var todoItems = document.getElementById("todoItems");
            for (var i = 0; i < rs.rows.length; i++) {
                rowOutput += renderTodo(rs.rows.item(i));
            }
          
            todoItems.innerHTML = rowOutput;
        }
        
        var db = app.db;
        db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM todo", [], 
                          render, 
                          app.onError);
        });
    },

    // result contains any message sent from the plugin call
    successHandler: function(result) {
        //alert('Callback Success! Result = '+result)
        console.log('lgh en successHandler(registrando para push): Callback Success! Result = '+result )
    },
    errorHandler: function(error) {
        alert(error);
    },
    onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    //asigno a la app el regid obtenido
                    app.regid = e.regid;
                    console.log("lgh Regid " + e.regid);
                    //alert('registration id = '+e.regid);
                    
                }
            break;
 
            case 'message':
              // this is the actual push notification. its format depends on the data model from the push server
              alert('message = '+e.message+' msgcnt = '+e.msgcnt);
              app.persistirLocal();

            break;
 
            case 'error':
              alert('GCM error = '+e.msg);
            break;
 
            default:
              alert('An unknown GCM event has occurred');
              break;
        }
    },
    // geolocation plugin
    getLocation: function(){
        var onSuccess = function(position) { // es el codigo de la funcion leaflet
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            
            var map = L.map('map').setView([lat, lon], 13);
            // add an OpenStreetMap tile layer
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            // add a marker in the given location, attach some popup content to it and open the popup
            L.marker([lat, lon]).addTo(map)
                .bindPopup('Posición Aproximada') 
                .openPopup();

        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            console.log('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    },
    
    seePosition: function(){
        // onSuccess Callback
        //   This method accepts a `Position` object, which contains
        //   the current GPS coordinates
        //
        function onSuccess(position) {
            // var element = document.getElementById('geolocation');
            // element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
            //                     'Longitude: ' + position.coords.longitude     + '<br />' +
            //                     '<hr />'      + element.innerHTML;
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            
            var map = L.map('map').setView([lat, lon], 5);// original pasaba 13 en vez de 5, no cambia nada
            // add an OpenStreetMap tile layer
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            // add a marker in the given location, attach some popup content to it and open the popup
            L.marker([lat, lon]).addTo(map)
                .bindPopup('Posición Aproximada') 
                .openPopup();

        }
        
        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');
        }

        // Options: throw an error if no update is received every 30 seconds.
        //
        var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
    },

    checkSesion: function(){
    var db = app.db;
    var mostrarEmail = function (tx, rs) {
        //var retorno = null;
            for (var i = 0; i < rs.rows.length; i++) {
                app.email = rs.rows.item(i).email;
                alert('retorno ' + retorno);
                //app.email = retorno;
            }
            
            //return retorno;
        }

        db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM email", [], 
                          mostrarEmail, 
                          app.onError);
        });

    },

    addSesion: function(email) {
        var db = app.db;
        //delete de tabla email
        db.transaction(function(tx) {
            tx.executeSql("DELETE FROM email ", [],
                          app.onSuccess,
                          app.onError);
        });
        //creo la tabla email
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS email(ID INTEGER PRIMARY KEY ASC, email TEXT, added_on DATETIME)", []);
        });
        //insert registro en email
        db.transaction(function(tx) {
            var addedOn = new Date();
            tx.executeSql("INSERT INTO email(email, added_on) VALUES (?,?)",
                          [email, addedOn],
                          app.onSuccess,
                          app.onError);
        });

        var mostrarEmail = function (tx, rs) {
            for (var i = 0; i < rs.rows.length; i++) {
                alert('el select en i: '+ i +' '+ rs.rows.item(i).email);
            }
        }

        db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM email", [], 
                          mostrarEmail, 
                          app.onError);
        });

    },
    noCerrar: function(noCerrarSesion, email){
        alert('testf , noCerrarSesion: ' + noCerrarSesion);
        if(noCerrarSesion===1){
            alert('clavo registro');
            app.addSesion(email);
        }
    },

    mandarJquery: function(){
        $(document).ready(function() {
            //$("#formIngresar").addClass("pageLogin");
            //var email
            

            alert('en mandar jquery, app.email: ' + app.email);

            $("#loading").addClass("novisible");
            $("#deviceready").addClass("novisible");
            $("#viewrest").addClass("novisible");
            $("#btn2").addClass("novisible");
            
            $( ".menu").addClass("novisible");
            //var viewrest = document.getElementById("viewrest");
            //viewrest.style.display = "none";
            function mandarderecha(){
                $("#sqlite").addClass("derecha");
            }

            // login de rescatista
            $( "#login").click(function(){


                var email = document.getElementById("inputEmail").value;
                var password = document.getElementById("inputPassword").value;
                var noCerrarSesion = $( "input:checked" ).length; // si n = 1 , entonces no cerrar sesion
                //alert("email: " + email + " ,password: " + password + " ,nocerrar: " + noCerrarSesion);
                //alert("app.regid " + app.regid);
                
                app.noCerrar(noCerrarSesion,email);
                //$("#formIngresar").addClass("derecha");

                //var mapa = document.getElementById("map");
                //mapa.style.display = "none";
                //$("h2.form-signin-heading").addClass("derecha");
                //$( "#formIngresar").children().addClass("derecha");
                //$("#formIngresar").addClass("novisible");
            });
            

            $( "#btn2").click(function(){
                //alert("hola");
                //var mapa = document.getElementById("map");
                //mapa.style.display = "none";
                $("#map").addClass("derecha");

                //$("#formIngresar").addClass("derecha");
                //$("#formIngresar").addClass("novisible");
            });


            $( ".menu").click(function(){
                mandarderecha();
                //var divsqlite = document.getElementById("sqlite");
                //divsqlite.style.display = "none";
                //divsqlite.addClass("derecha");
                //alert('boton 1');
            });// end - $( "btn1").click(function(){
            
            $( ".menu1").click(function(){
                alert('boton 2');

            });// end - $( "btn2").click(function(){


            $( "#callrest").click(function(){
                console.log('lgh 1 entre');
                //alert('clickeaste');
                
                //This is a shorthand Ajax function, which is equivalent to
                /*$.ajax({
                  dataType: "json",
                  url: url,
                  data: data,
                  success: success
                });
                */

                //var idUsuario = document.getElementById("inputEmail3").value;
                //var password = document.getElementById("inputPassword3").value;
                //var idUsuario = $("#inputEmail3").val();
                
                //var urljson = "http://192.168.43.166:8080/catastrophes-system-web/rest/ServicesUsuario/alta/"+idUsuario+"/"+password;
                //var urljson = "http://192.168.43.166:8080/catastrophes-system-web/rest/ServicesUsuario/alta/cucu/12";
                var urljson = "http://rest-service.guides.spring.io/greeting";
                //var urljson = "http://192.168.1.43:8080/catastrophes-system-web/rest/ServicesUsuario/alta/"+idUsuario+"/"+password;

                //var urljson = "http://192.168.1.43:8080/catastrophes-system-web/rest/ServicesUsuario/get";
                $.ajax({
                    url: "http://192.168.1.43:8080/catastrophes-system-web/rest/ServicesUsuario/get"
                }).then(function(data) {
                    console.log('lgh en llamoRest dentro del .then');
                    alert(data);
                });
                /*
                $.getJSON(urljson , function( data ) {
                  //alert("user: " + data.User + "password: "+ data.password);
                  alert(data);
                  console.log("lgh 2" + data);
                });
                
                console.log("lgh 3" + data);
                
                $.postJSON(urljson , function( data ) {
                  //alert("user: " + data.User + "password: "+ data.password);
                  alert(data);
                  console.log("lgh 2" + data);
                });
                console.log("lgh 3" + data);
                
                $.ajax({
                    url: urljson//""
                    }).then(function(data) {
                    console.log('lgh 2 data');
                    alert('lgh 3' + data);
                });
                */



                //$(".content").addClass(className)

            });// end - $( ".menu").click(function(){
            


        });// end - $(document).ready
    }
    
    
};

app.email = null; // sesion

app.regid = null;

// del ejemplo sqlite
app.db = null;
// function init() {
//     navigator.splashscreen.hide();
//     app.openDb();
//     app.createTable();
//     app.refresh();
// }      
function addTodo() {
    var todo = document.getElementById("todo");
    app.addTodo(todo.value);
    todo.value = "";
}
//FIN del ejemplo sqlite


/*


    // accion para el boton segun la clase menu
/*    
    $( ".menu").click(function(){
        $.ajax({
            url:"http://192.168.1.43:8080/catastrophes-system-web/rest/MyRESTApplication"
        }).then(function(data) {
            console.log('lgh en llamoRest dentro del .then');
            alert(data);
           // $('#holarest-id').append(data);
        });
    });// end - $( ".menu").click(function(){
*/



// ,

    // bindClickBoton: function(){
    //     $(document).ready(function() {
    //         $(".menu").click(function(){
    //             $(".menu")addClass("menuonclick");
    //         });
    //     });
    // }
    //,

    // llamoRest: function(){
    // console.log('lgh en llamoRest ');
    //     $(document).ready(function() {
    //         //$.ajax({
    //         $.get({
    //             url: "http://todoapp-todoapphpdluz.rhcloud.com/rest/todos"
    //         }).then(function(data) {
    //            //$('#datarest').append(data);
    //            console.log('lgh data del rest ' + data);
    //         });
    //     });
    // }


/////////////////////////////////////// EJEMPLOS


    //leaflet maps
    // leaflet: function() { // ejemplo
    //     console.log('lgh en leaflet');        
    //     var map = L.map('map').setView([51.505, -0.09], 13);
    //     // add an OpenStreetMap tile layer
    //     L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //         attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    //     }).addTo(map);
    //     L.marker([51.5, -0.09]).addTo(map)
    //         .bindPopup('A pretty CSS3 popup. <br> Easily customizable.') 
    //         .openPopup();
    // },

///////////////////////////////////////////