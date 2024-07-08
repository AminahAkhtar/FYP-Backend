const express = require('express');
const Biker = require('../models/Biker');
const Franchiser = require('../models/Franchiser');
const SwapRequest = require('../models/SwapRequest');
const Battery = require('../models/Battery')
const router = express.Router();
const bcrypt = require('bcryptjs')
const {body, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const axios = require('axios');
const multer = require('multer');
const path = require('path');

// GET request to fetch user profile details
// router.get('/profile/:phoneNumber', async (req, res) => {
//     try {
//         const { phoneNumber } = req.params;

//         // Find the biker record by phone number
//         const biker = await Biker.findOne({ phoneNumber });

//         if (!biker) {
//             return res.status(404).json({ error: 'Biker not found' });
//         }

//         // Return only the necessary profile details
//         const userProfile = {
//             phoneNumber: biker.phoneNumber,
//             name: biker.name || '', // Return empty string if name is null
//             email: biker.email || ''  // Return empty string if email is null
//         };

//         return res.status(200).json(userProfile);
//     } catch (error) {
//         console.error('Error fetching user profile:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });


// // POST request to update user profile details (name, email)
// router.post('/profile/:phoneNumber', async (req, res) => {
//     try {
//         const { phoneNumber } = req.params;
//         const { name, email } = req.body;

//         // Find the biker record by phone number
//         let biker = await Biker.findOne({ phoneNumber });

//         if (!biker) {
//             return res.status(404).json({ error: 'Biker not found' });
//         }

//         // Update the name and email fields
//         biker.name = name;
//         biker.email = email;

//         // Save the updated biker record
//         await biker.save();

//         return res.status(200).json({ message: 'User profile updated successfully' });
//     } catch (error) {
//         console.error('Error updating user profile:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });


router.get('/profile/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        // Find the biker record by phone number
        const biker = await Biker.findOne({ phoneNumber });

        if (!biker) {
            return res.status(404).json({ error: 'Biker not found' });
        }

        let base64Image = '';
        // Check if profile image exists
        if (biker.profileImage) {
            // Read the image file from the uploads folder
            const imagePath = path.join(__dirname, './uploads', biker.profileImage);
            const image = fs.readFileSync(imagePath);

            // Convert image data to Base64
            base64Image = Buffer.from(image).toString('base64');
        }

        // Return profile details along with Base64-encoded image data
        const userProfile = {
            phoneNumber: biker.phoneNumber,
            name: biker.name || '',
            email: biker.email || '',
            profileImage: base64Image // Include Base64-encoded image data or empty string if not found
        };

        return res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'routes/uploads'); // Folder to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});
const upload = multer({ storage: storage });

router.post('/profile/:phoneNumber', upload.single('profileImage'), async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const { name, email } = req.body;
        const profileImage = req.file ? req.file.filename : null;

        // Find the biker record by phone number
        const biker = await Biker.findOne({ phoneNumber });

        if (!biker) {
            return res.status(404).json({ error: 'Biker not found' });
        }

        // Update the name, email, and image fields
        biker.name = name;
        biker.email = email;
        if (profileImage) {
            biker.profileImage = profileImage;
        }
        console.log(name,email,profileImage)
        // Save the updated biker record
        await biker.save();

        return res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to handle phone number
// router.post('/register', async (req, res) => {
//     const { phoneNumber} = req.body;

//     try {
//         // Create a new biker document
//         let biker = new Biker({ phoneNumber});
        
//         // Save to the database
//         await biker.save();

//         res.status(201).json({ message: 'Biker registered successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });
router.post('/register', async (req, res) => {
    const { phoneNumber } = req.body;
  
    try {
      // Check if the phone number already exists
      let existingBiker = await Biker.findOne({ phoneNumber });
      
      if (existingBiker) {
        return res.status(400).json({ error: 'Phone number already exists' });
      }
  
      // Create a new biker document
      let biker = new Biker({ phoneNumber });
  
      // Save to the database
      await biker.save();
  
      res.status(201).json({ message: 'Biker registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

// Route to check if the phone number exist already
router.get('/check/:phoneNumber', async (req, res) => {
    const { phoneNumber } = req.params;

    try {
        const biker = await Biker.findOne({ phoneNumber });

        if (biker) {
            res.status(200).json({ message: 'Registered user', biker });
        } else {
            res.status(200).json({ message: 'Not registered user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


// Route to get nearest franchisers based on biker's phone number
router.get('/nearest-franchiser/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        // Find the biker based on phone number
        const biker = await Biker.findOne({ phoneNumber });

        if (!biker) {
            return res.status(404).json({ error: 'Biker not found' });
        }

        // Ensure that the biker's location data exists and is not null
        if (!biker.location || !biker.location.coordinates || biker.location.coordinates.length < 2) {
            return res.status(400).json({ error: 'Biker location data is missing or invalid' });
        }

        console.log(biker.location)

        // Retrieve latitude and longitude of the biker
        const bikerLatitude = biker.location.coordinates[1];
        const bikerLongitude = biker.location.coordinates[0];
        
        
        // Find all franchisers
        const franchisers = await Franchiser.find({});
        
        // Calculate distances and filter nearest franchisers
        const nearestFranchisers = [];
        for (const franchiser of franchisers) {

            // Ensure franchiser location data exists and is valid
            if (!franchiser.location || !franchiser.location.coordinates || franchiser.location.coordinates.length < 2) {
                continue; // Skip this franchiser if location data is invalid
            }
            // Calculate distance between biker and franchiser
            const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
                params: {
                    origin: `${bikerLatitude},${bikerLongitude}`,
                    destination: `${franchiser.location.coordinates[1]},${franchiser.location.coordinates[0]}`,
                    key: 'AIzaSyDK7vRWhnxX8DgluGK9oT5K47AfSEz-J84',
                },
            });

            // Ensure the response contains routes and legs data
            if (!response.data.routes || response.data.routes.length === 0 || !response.data.routes[0].legs || response.data.routes[0].legs.length === 0) {
                continue; // Skip if no valid route found
            }
            const route = response.data.routes[0];
            const distance = route.legs[0].distance.value; // Distance in meters
            const duration = route.legs[0].duration.text;
            const originalDurationInSeconds = route.legs[0].duration.value; // Get the duration in seconds

            // Convert duration to minutes and add 10 minutes
            const totalDurationInMinutes = Math.ceil((originalDurationInSeconds + (10 * 60)) / 60);

            // Check if total duration is greater than or equal to 60 minutes
            if (totalDurationInMinutes >= 60) {
                const hours = Math.floor(totalDurationInMinutes / 60);
                const minutes = totalDurationInMinutes % 60;
                totalDuration = `${hours} hr ${minutes} mins`;
            } else {
                totalDuration = `${totalDurationInMinutes} mins`;
            }

            if (distance < 10000) { // Consider franchisers within 100 kilometers (100,000 meters)
                nearestFranchisers.push({
                    franchiserId: franchiser._id,
                    franchiserName: franchiser.name,
                    franchiserPhoneNumber: franchiser.phoneNumber,
                    distance: distance / 1000 + ' kms', // Convert distance to kilometers
                    durationToReach: totalDuration,
                    franchiserLocation: {
                        latitude: franchiser.location.coordinates[1],
                        longitude: franchiser.location.coordinates[0]
                    },
                });
            }
        }

        return res.json({
            nearestFranchisers,
            biker: {
                bikerName: biker.name,
                latitude: bikerLatitude,
                longitude: bikerLongitude,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Check Swap Request Status endpoint
router.get('/checkSwapRequestStatus/:swapRequestId', async (req, res) => {
  const { swapRequestId } = req.params;

  try {
      // Fetch the swap request based on the provided ID
      const swapRequest = await SwapRequest.findById(swapRequestId);
      if (!swapRequest) {
          return res.status(404).json({ message: 'Swap request not found' });
      }

     // Check if the request value is empty, then update it to "rejected"
     if (swapRequest.request === '') {
      swapRequest.request = 'rejected';
      await swapRequest.save();
  }

    // Respond accordingly based on the updated status
    if (swapRequest.request === 'accepted') {
        res.status(200).json({ message: 'Request accepted, proceed to payment' });
    } else if (swapRequest.request === 'rejected') {
        res.status(200).json({ message: 'Send request to another station' });
    }

  } catch (error) {
      console.error('Error checking swap request status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// // Function to send email notification to franchiser
// async function sendEmailNotification(franchiserEmail, message, token) {
//   // Create a Nodemailer transporter
//   const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//           user: 'aminah30akhtar3a@gmail.com', // Your Gmail email address
//           pass: 'rekk zctd wual aepq' //app password
//       },
//       tls: {
//           rejectUnauthorized: false // Trust self-signed certificate
//       }
//   });

//   // Email message options
//   const mailOptions = {
//       from: 'BSHM - Swap Request Notification <aminah30akhtar3a@gmail.com>', // Sender email address
//       to: franchiserEmail, // Receiver email address
//       subject: 'BSHM - Swap Request Notification',
//       html: `<h4 style="color: black;">${message}</h4>
//       <p style="color: black;">Dear Franshier, <br>
//          A new swap request is received. Please check your application dashboard for further actions. <br>
//          Thank You.<br>
//          Team BSHM. </p>`
//   };

//   try {
//       // Send email
//       const info = await transporter.sendMail(mailOptions);
//       console.log('Email notification sent:', info.response);
//   } catch (error) {
//       console.error('Error sending email notification:', error);
//   }
// }

//google map [lat,lng]
//nodejs bydefault [lng,lat]

//Battery info
// Endpoint to retrieve battery information based on MAC address
router.get('/battery-info/:macAddress', async (req, res) => {
    const { macAddress } = req.params;
  
    try {
      // Find the battery based on the provided MAC address
      const battery = await Battery.findOne({ mac_address: macAddress });
  
      if (!battery) {
        return res.status(404).json({ error: 'Battery with provided MAC address not found' });
      }
  
      // Extract battery information
      const { battery_number, franchiser, price, batterylevel } = battery;
  
      // Construct the response object
      const batteryInfo = {
        battery_number,
        franchiser,
        price,
        batterylevel,
      };
  
      return res.json(batteryInfo);
    } catch (error) {
      console.error('Error fetching battery information:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

// Endpoint to store latitude and longitude values of a biker based on email
router.post('/store-location', async (req, res) => {
    const { phoneNumber, latitude, longitude } = req.body;
  
    try {
      // Find the biker based on the provided email
      const biker = await Biker.findOne({ phoneNumber });
  
      if (!biker) {
        return res.status(404).json({ error: 'Biker with provided phoneNumber not found' });
      }
  
      // Update the location coordinates of the biker
      biker.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
  
      // Save the updated biker document
      await biker.save();
  
      return res.status(200).json({ message: 'Location stored successfully' });
    } catch (error) {
      console.error('Error storing biker location:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
// GET endpoint to retrieve battery MAC address based on biker's phone number
router.get('/battery-mac/:phoneNumber', async (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    try {
        const biker = await Biker.findOne({ phoneNumber });
        if (!biker) {
            return res.status(404).json({ error: 'Biker not found' });
        }
        const latestSwapRequest = await SwapRequest.findOne({ biker: biker._id, request: 'accepted' })
            .sort({ datetime: -1 }) 
            .populate('battery'); 

        if (!latestSwapRequest) {
            return res.status(404).json({ error: 'No accepted swap request found for the biker' });
        }
        const batteryMacAddress = latestSwapRequest.battery.mac_address;
        res.json({ batteryMacAddress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
  // Endpoint for bikers to send swap requests to swap stations
  router.post('/requestSwapSocket', async (req, res) => {
    const { bikerPhoneNumber, franchiserPhoneNumber, batteryId } = req.body;

    try {
        // Fetch the biker ID based on the phone number
        const biker = await Biker.findOne({ phoneNumber: bikerPhoneNumber });
        if (!biker) {
            return res.status(404).json({ message: 'Biker not found' });
        }

        // Fetch the franchiser ID based on the phone number
        const franchiser = await Franchiser.findOne({ phoneNumber: franchiserPhoneNumber });
        if (!franchiser) {
            return res.status(404).json({ message: 'Franchiser not found' });
        }
        // Fetch the battery based on the battery ID
        const battery = await Battery.findById(batteryId);
        if (!battery) {
            return res.status(404).json({ message: 'Battery not found' });
        }

        // Create a new swap request and save it to the database
        const now = new Date();
        const swapRequest = new SwapRequest({
            biker: biker._id,
            franchiser: franchiser._id,
            battery: battery._id,
            batteryStatus: '',
            request: '',
            amount: '',
            datetime: now,
        });
        await swapRequest.save();

        // Emit swap request event to all connected clients
        const io = req.app.get('io');
        // Send real-time notification to franchiser
        io.emit('newSwapRequest', {
            franchiserId: franchiser._id,
            bikerName: biker.name,
            bikerPhoneNumber: biker.phoneNumber,
            franchiserName: franchiser.name,
            batteryNumber: battery.battery_number, // Accessing batteryNumber from Battery model
            swapRequestId: swapRequest._id,
        });

        // Return the swap request ID and additional information as part of the response
        res.status(200).json({
            message: 'A new swap request is generated',
            swapRequestId: swapRequest._id,
            bikerName: biker.name,
            bikerPhoneNumber: biker.phoneNumber,
            franchiserName: franchiser.name,
            batteryNumber: battery.battery_number,
        });
    } catch (error) {
        console.error('Error processing swap request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router