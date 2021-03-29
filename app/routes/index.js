const Router = require('koa-router'),
      KoaBody = require('koa-body'),
     {selectQuery} = require('../controllers/indexController');

const router = new Router();

    router

        .get('/users/:key/:id_query',      selectQuery)

module.exports = {
    routes () { return router.routes() },
    allowedMethods () { return router.allowedMethods() }
};

// const Router = require('koa-router'),
//     {getHello, getTicker} = require('../controllers/testController'),
//     router = new Router();
// ;
//
//     router
//         .get('/test', getHello)
//         .get('/test/:name', getHello)
//         .get('/ticker/:ticker', getTicker)
//     ;
//
// module.exports = {
//     routes () { return router.routes() },
//     allowedMethods () { return router.allowedMethods() }
// };