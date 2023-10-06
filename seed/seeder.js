import { exit } from 'node:process'
import categorias from './categorias.js'; //Los Datos
import precios from './precios.js'; //Los Datos
import usuarios from './usuarios.js'; //Los Datos
import db from '../config/db.js'; //Conexion a la Base de Datos
import { Categoria, Precio, Usuario } from '../models/index.js' //Modelos

const importarDatos = async () => {
    try {
        // Autenticar
        await db.authenticate()

        // Generar las Columnas
        await db.sync()
        
        // Insertamos los datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])
        
        
        console.log('Datos Importados correctamente')
        exit()

    } catch (error) {
        console.log(error)
        exit(1)
    }
}

const eliminarDatos = async () => {
    try {
        /*await Promise.all([
            Categoria.destroy({where: {}, truncate: true}),
            Precio.destroy({where: {}, truncate: true})
        ])*/
        await db.sync({force: true})
        console.log('Datos Eliminados Correctamente...')
        exit();
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === "-i") {
    importarDatos();
}

if(process.argv[2] === "-e") {
    eliminarDatos();
}