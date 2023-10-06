import bcrypt from 'bcrypt'
const usuarios = [
    {
        nombre: 'Douglas',
        email: 'disturiz362@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('hola1234', 10)
    },
    {
        nombre: 'Steve Job',
        email: 'steve@apple.com',
        confirmado: 1,
        password: bcrypt.hashSync('hola1234', 10)
    },
    {
        nombre: 'Bill Gate',
        email: 'billg@microsoft.com',
        confirmado: 1,
        password: bcrypt.hashSync('hola1234', 10)
    },
    {
        nombre: 'Elon Musk',
        email: 'elonm@tesla.com',
        confirmado: 1,
        password: bcrypt.hashSync('hola1234', 10)
    },
    
]


export default usuarios