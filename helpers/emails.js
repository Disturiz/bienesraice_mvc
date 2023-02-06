import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const { email, nombre, token } = datos;

      // Enviar el email
      await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
          <p>Hola ${nombre}, Bienvenido y comprueba tu cuenta en BienesRaices.com</p>

          <p>Tu cuenta está lista solo debes confirmarla en el siguiente enlace: 
             <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a>
          </p>

          <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>

          <p>Saludos cordiales!</p>
        `
      })
}

const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const { email, nombre, token } = datos;

    // Enviar el email
    await transport.sendMail({
      from: 'BienesRaices.com',
      to: email,
      subject: 'Restablece tu password en BienesRaices.com',
      text: 'Restablece tu password en BienesRaices.com',
      html: `
        <p>Hola ${nombre}, has solicitado restablecer tu password en BienesRaices.com</p>

        <p>Sigue  en el siguiente enlace para generar un password nuevo: 
           <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer Password</a>
        </p>

        <p>Si tu no solicitaste cambio de password, puedes ignorar el mensaje</p>

        <p>Saludos cordiales!</p>
      `
    })
}


export {
    emailRegistro,
    emailOlvidePassword
}