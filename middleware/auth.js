// --- START OF FILE middleware/auth.js ---
const jwt = require('jsonwebtoken');

// Chave secreta JWT. Deve ser a mesma usada no routes/auth.js
const JWT_SECRET = process.env.JWT_SECRET || 'SEU_SEGREDO_SUPER_SECRETO'; 

/**
 * Middleware para verificar o token JWT no cabeçalho Authorization e
 * anexar o ID do usuário (req.userId) à requisição.
 * 
 * Espera o formato: Authorization: Bearer <token>
 */
const auth = (req, res, next) => {
    // 1. Obter o token do cabeçalho
    const authHeader = req.header('Authorization');

    // Checa se o cabeçalho existe e se está no formato 'Bearer <token>'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Acesso negado. Token não fornecido ou formato inválido.' });
    }
    
    // Extrai apenas o token (ignora 'Bearer ')
    const token = authHeader.replace('Bearer ', '');

    // 2. Verificar o token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Anexar o userId (obtido do payload do token) à requisição
        // O payload do token foi definido como { user: { id: user.id } } em routes/auth.js
        req.userId = decoded.user.id; 
        
        // 4. Continuar para a próxima função da rota
        next();
        
    } catch (e) {
        console.error("Erro na verificação do token:", e.message);
        // O erro mais comum aqui é 'jwt expired' (token expirado)
        res.status(401).json({ msg: 'Token inválido ou expirado.' });
    }
};

module.exports = auth;
// --- END OF FILE middleware/auth.js ---