import { check, validationResult } from 'express-validator'
import Usuario from '../models/Usuario.js'

const   formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'  
    })
}

const   formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'  
    })
}


const registrar = async (req, res) => {
    // Validación
    await check('nombre').notEmpty().withMessage('El nombre es requerido').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password deber ser al menos de 6 catacteres').run(req)
    if (req.body.repetir_password !== req.body.password) {
        await check('password').isLength({ min: 20 }).withMessage('Los passwords no son iguales').run(req)
    }
    //await check('repetir_password').equals('password').withMessage('Los passwords no son iguales').run(req)
    
    
    let resultado = validationResult(req)
  
    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }  
        })
    }

    // Extraer los datos
    const { nombre, email, password } = req.body   
    // Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({ where : { email }}) 
    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'El Usuario ya esta Registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }

    // Añmacenar un usuario
    await Usuario.create({
        nombre,
        email,
        password,
        token: 123
    })

}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices'
    })
}

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    formularioOlvidePassword
}