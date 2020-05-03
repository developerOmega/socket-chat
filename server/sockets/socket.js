const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje }= require('../utilidades/utilidades')
let usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        if(!data.nombre || !data.sala){
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }

        client.join(data.sala);

        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);
        
        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala( data.sala ) );

        callback(usuarios.getPersonasPorSala( data.sala ));

    });

    client.on('crearMensaje', data => {
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje( persona.nombre, data.mensaje );
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    })

    //Mensajes privados
    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona( client.id );
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    })

    client.on('disconnect', () => {

        let personaBorrada = usuarios.borarPersona(client.id);
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Admin', `${personaBorrada.nombre} abandolo el chat`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala( personaBorrada.sala ) );
    });
   
});