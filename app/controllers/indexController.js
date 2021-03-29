
const myDb = require('../managers/clickhouseManager'),
    Joi = require('joi'),

    // Simple user schema, more info: https://github.com/hapijs/joi
    userSchema = Joi.object().keys({
        name: Joi.string().trim().required()
    });


/**
 * @example curl -XPOST "http://localhost:8081/users/key/id_query"
 */
async function selectQuery (ctx, next) {
    // Joi validation, more info: https://github.com/hapijs/joi
    let body = await Joi.validate(ctx.request.body, userSchema, {allowUnknown: true});
    ctx.body = await myDb.selectQuery(ctx.params.key,ctx.params.id_query);
    await next();

}
module.exports = {selectQuery};
