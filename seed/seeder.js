import { exit } from 'node:process'
import categorias from './categorias.js'; //Los Datos
import precios from './precios.js'; //Los Datos
import Categoria from '../models/Categoria.js' //Modelo
import Precio from '../models/Precio.js' //Modelo
import db from '../config/db.js'; //Conexion a la Base de Datos

const importarDatos = async () => {
    try {
        // Autenticar
        await db.authenticate()

        // Generar las Columnas
        await db.sync()
        
        // Insertamos los datos
         
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios)
        ])
        
        console.log('Datos Importados correctamente')
        exit()

    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === "-i") {
    importarDatos();
}