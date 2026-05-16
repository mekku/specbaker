/**
 * Web Command
 * 
 * Start the web interface for SpecBaker
 */

const SpecBakerServer = require('../../web/server');

/**
 * Web command handler
 */
async function webCommand(options) {
    const port = options.port || process.env.PORT || 3000;

    console.log('Starting SpecBaker web interface...\n');

    const server = new SpecBakerServer(port);
    server.start();
}

module.exports = webCommand;

// Made with Bob
