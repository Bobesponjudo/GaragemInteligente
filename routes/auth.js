// --- START OF FILE routes/auth.js ---
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Assumimos que o modelo User foi registrado com mongoose.model('User', ...)
const User = mongoose.model('User'); 

// Chave secreta JWT. No ambiente de produção, esta deve vir de process.env
const JWT_SECRET = process.env.JWT_SECRET || 'SEU_SEGREDO_SUPER_SECRETO'; 

/**
 * @route   POST /api/auth/register
 * @desc    Registrar um novo usuário
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Email e senha são obrigatórios.' });
        }

        // 1. Verificar se o usuário já existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Usuário já existe' });
        }

        // 2. Criar novo usuário (ainda sem senha criptografada)
        user = new User({ email, password });

        // 3. Criptografar a senha: Gerar um hash seguro
        const salt = await bcrypt.genSalt(10); // 10 é o número de rounds
        user.password = await bcrypt.hash(password, salt); // Atualiza a senha do modelo

        // 4. Salvar o novo usuário no banco de dados
        await user.save();
        
        // 5. Retornar mensagem de sucesso
        res.status(201).json({ msg: 'Usuário registrado com sucesso!', userId: user._id });

    } catch (err) {
        console.error("Erro no registro:", err.message);
        // Erro de validação ou outro erro do servidor
        res.status(500).send('Erro no Servidor durante o registro');
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário e obter token
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Email e senha são obrigatórios.' });
        }

        // 1. Buscar o usuário no banco de dados
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciais inválidas' }); // Evita informar se o erro foi no email ou na senha
        }

        // 2. Comparar a senha enviada com a senha criptografada
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciais inválidas' });
        }

        // 3. Gerar um JWT
        const payload = {
            user: {
                id: user.id // Payload do token
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET, // Chave secreta
            { expiresIn: '1h' }, // Expira em 1 hora
            (err, token) => {
                if (err) throw err;
                // 4. Retornar o token
                res.json({ token });
            }
        );

    } catch (err) {
        console.error("Erro no login:", err.message);
        res.status(500).send('Erro no Servidor durante o login');
    }
});

module.exports = router;
// --- END OF FILE routes/auth.js ---