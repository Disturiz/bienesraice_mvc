import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import { generarJWT, generarId } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

const   formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()  
    })
}

const autenticar = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('El Email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('El password deber ser obligatorio').run(req)

    let resultado = validationResult(req)
  
    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array() 
        })
    }

    const { email, password } = req.body

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: {email} })
    if(!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario no Existe'}] 
        })
    }

    // Comprobar que el usuario esta confirmado
    if(!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu Cuenta no hasido Confirmada'}] 
        }) 
    }

    // Revisar el password
    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Password es Incorrecto'}] 
        })
    }

    // Autenticar al usuario
    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre })

    console.log(token);

    // Almacenar en un cookie

    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true
    }).redirect('/mis-propiedades')
}


const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const   formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',  
        csrfToken: req.csrfToken()
    })
}


const registrar = async (req, res) => {
    // Validación
    await check('nombre').notEmpty().withMessage('El nombre es requerido').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password deber ser al menos de 6 catacteres').run(req)
    /*if (req.body.repetir_password !== req.body.password) {
        await check('password').isLength({ min: 20 }).withMessage('Los passwords no son iguales').run(req)
    }*/
    await check('repetir_password')
    .equals(req.body.password)
    .withMessage('Los passwords no son iguales')
    .run(req)
    
    
    let resultado = validationResult(req)
  
    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
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
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario ya esta Registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }

    // Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // Envia email de Confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })



    // Mostrar mensaje de confirmación
    res.render('plantillas/mensaje', {
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un Email de Confirmación, favor presionar en el enlace'
    })
}

// Función que comprueba una cuenta
const confirmar = async (req, res) => {

    const { token } = req.params;
    
    // Verificar si el token es valido
    const usuario = await Usuario.findOne({ where: {token}})

    //console.log(usuario);

   if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true 
        })
    }

    //Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'Bienvenido!!, La cuenta se confirmo correctamente',
    })

    
}


const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken()
    })
}

const resetPassword =  async (req, res) => {
        // Validación
        await check('email').isEmail().withMessage('Eso no parece un email').run(req)
        let resultado = validationResult(req)
      
        // Verificar que el resultado este vacio
        if(!resultado.isEmpty()) {
            // Errores
            return res.render('auth/olvide-password', {
                pagina: 'Recupera tu acceso a Bienes Raices',
                csrfToken: req.csrfToken(),
                errores: resultado.array()
            })
        }

        // Buscar el Usuario

        const { email } = req.body

        const usuario = await Usuario.findOne({ where: { email } })
        if(!usuario) {
            return res.render('auth/olvide-password', {
                pagina: 'Recupera tu acceso a Bienes Raices',
                csrfToken: req.csrfToken(),
                errores: [{msg: 'El email no pertenece a ningún usuario'}]
            })
        }

        //Generar un Token y enviar el email
        usuario.token =  generarId();
        await usuario.save();

        // Enviar un Email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        // Mostrar un mensaje
        res.render('plantillas/mensaje', {
            pagina: 'Resstablece tu Password',
            mensaje: 'Hemos enviado un email con las Instrucciones'
        })
}

const comprobarToken = async (req, res) => {
    
    const { token } = req.params;

    const usuario = await Usuario.findOne({where: {token}});
    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu Password',
            mensaje: 'Hubo un error al validar información, Intenta de nuevo',
            error: true 
        })
    }

    // Mostrar formulario para modificar el Password
    res.render('auth/reset-password', {
        pagina: 'Reestablece Tu Password',
        csrfToken: req.csrfToken()
        
    })
}


const nuevoPassword = async (req, res) => {
    // Validar el Password
    await check('password').isLength({ min: 6 }).withMessage('El password deber ser al menos de 6 catacteres').run(req)

    let resultado = validationResult(req)
  
    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/reset-password', {
            pagina: 'Reestablece Tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const { token } = req.params
    const { password } = req.body;

    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({where: {token}})

    console.log(usuario)

   
     // Hashear el nuevo password
     const salt = await bcrypt.genSalt(10)
     usuario.password = await bcrypt.hash( password, salt);
     usuario.token = null;

     await usuario.save();

     res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El Password se guardó correctamente'
     })
}   

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}