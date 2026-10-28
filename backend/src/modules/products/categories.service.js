const categoriesModel = require("./categories.model");

async function getAll() {
    return categoriesModel.findAll();
}

module.exports = { getAll };
