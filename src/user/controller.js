const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userService = require('./service');

async function createUser(req, res) {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Faltan datos en la petición. Asegúrate de enviar Content-Type: application/json' });
        }

        const { ficha, id_area, nombre, rol, numero, correo, password } = req.body;
        if (!ficha || !nombre || !password) {
            return res.status(400).json({ error: 'Ficha, nombre y contraseña son obligatorios' });
        }

        await userService.createUser({ ficha, id_area, nombre, rol, numero, correo, password });
        
        console.log('Usuario creado exitosamente:', { ficha, id_area, nombre, rol, numero, correo });

        res.status(201).json({ 
            message: 'Usuario creado exitosamente',
            user: { ficha, id_area, nombre, rol, numero, correo }
        });
    } catch (error) {
        if (error.message === 'El usuario con esta ficha ya existe') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function login(req, res) {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Faltan datos en la petición. Asegúrate de enviar Content-Type: application/json' });
        }

        const { ficha, password } = req.body;
        if (!ficha || !password) {
            return res.status(400).json({ error: 'Ficha y contraseña son obligatorias para iniciar sesión' });
        }

        const user = await userService.getUserByFicha(ficha);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no registrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        delete user.password;

        // Generar JWT
        const token = jwt.sign(
            { ficha: user.ficha, rol: user.rol, nombre: user.nombre }, 
            process.env.JWT_SECRET || 'secretKeyDefault', 
            { expiresIn: '24h' }
        );

        console.log('✅ Inicio de sesión exitoso para la ficha:', ficha);
        res.status(200).json({ 
            message: 'Inicio de sesión exitoso',
            token,
            user 
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getUsers(req, res) {
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function updateUser(req, res) {
    try {
        const { ficha } = req.params;
        const { id_area, nombre, numero, correo } = req.body;
        
        const changes = await userService.updateUser(ficha, { id_area, nombre, numero, correo });
        if (changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Obtener el usuario actualizado para devolverlo
        const updatedUser = await userService.getUserByFicha(ficha);
        res.status(200).json({ message: 'Perfil actualizado exitosamente', user: updatedUser });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function deleteUser(req, res) {
    try {
        const { ficha } = req.params;
        const changes = await userService.deleteUser(ficha);
        if (changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    createUser,
    login,
    getUsers,
    updateUser,
    deleteUser
};
