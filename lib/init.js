/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2017 CRS4                                 *
 *    This file is part of CRS4 Microservice Core - Mailer (CMC-Mailer).      *
 *                                                                            *
 *     CMC-Mailer is free software: you can redistribute it and/or modify     *
 *     it under the terms of the GNU General Public License as published by   *
 *       the Free Software Foundation, either version 3 of the License, or    *
 *                    (at your option) any later version.                     *
 *                                                                            *
 *     CMC-Mailer is distributed in the hope that it will be useful,          *
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        *
 *               GNU General Public License for more details.                 *
 *                                                                            *
 *     You should have received a copy of the GNU General Public License      *
 *    along with CMC-Maileer.  If not, see <http://www.gnu.org/licenses/>.    *
 * ############################################################################
 */



/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('mailerms:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = undefined;
var server =undefined;

var init = {
  start : (cb) => {
    port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);

    server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    if(cb) cb(port);
  },

  stop: (cb) => {
    server.close(cb);
  }

}

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


module.exports = exports = init;
