const bcrypt = require('bcrypt');

const encripteSenha = async (senha) => {
    const encriptar = 10;
    return await bcrypt.hash(senha, encriptar);
};

const compareSenha = async (senha, hash) => {
    return await bcrypt.compare(senha, hash);
}

module.exports = {encripteSenha, compareSenha};