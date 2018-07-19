// DATA container
let data = [];


// OSC.js stuff
const handleMessage = (msg) => {
    // console.log('MSG', msg);
    data = msg.address.split('/');
}

const initOSC = () => {
    // Init container

    // Init port
    oscPort = new osc.WebSocketPort({
        url: "ws://localhost:8081"
    });


    // listen
    oscPort.on('message', (msg) => {
        handleMessage(msg); // Debugging
    });
    
    // open port
    oscPort.open();
};

// used later to start OSC
window.initOSC = initOSC();

// Additional code below
