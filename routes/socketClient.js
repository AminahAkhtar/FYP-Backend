const ioClient = require('socket.io-client');
const socket = ioClient.connect('https://bshm.vercel.app/'); // Ensure this matches your server URL

// Listen for events from the server
socket.on('eventName', (data) => {
    console.log('Received event from server:', data);
});

// Listen for the 'newSwapRequest' event
socket.on('newSwapRequest', (data) => {
    const { franchiserId, bikerPhoneNumber, batteryId } = data;
    console.log(`New swap request received for franchiser with ID: ${franchiserId}, biker phone number: ${bikerPhoneNumber}, for battery: ${batteryId}`);

});

socket.on('swapRequestAccepted', (data) => {
    const {franchiserName, franchiserPhoneNumber} = data
    console.log(data.franchiserName, data.franchiserPhoneNumber)
    console.log(`Your request is accpeted by franchiser: ${franchiserName}, ${franchiserPhoneNumber}`)
});

socket.on('swapRequestRejected', (data) => {
    const {franchiserName, franchiserPhoneNumber} = data
    console.log(`Your request is rejected by franchiser: ${franchiserId} , ${franchiserPhoneNumber}, please try some other station`)
});

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
});
