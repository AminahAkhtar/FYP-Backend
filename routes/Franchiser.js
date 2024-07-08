const express = require('express');
const Franchiser = require('../models/Franchiser');
const Battery = require('../models/Battery');
const SwapRequest = require('../models/SwapRequest');
const router = express.Router();
const bcrypt = require('bcryptjs')
const {body, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const multer = require('multer');


// var fetchuser = require('../middleware/fetchuser')
const JWT_SECRET = 'bshm'



// router.post('/registerfranchiser', [
//     body('name', 'Enter a valid name').isLength({min:3}),
//     body('email', 'Enter a valid email').isEmail(),
//     body('password','Password must be atleast 5 characters').isLength({min:5}),
//     body('phoneNumber', 'Phone number must be 11 digits starting with 0').matches(/^0\d{10}$/)
// ], async (req,res) => {
//   let success=false;
//   const errors = validationResult(req);
//   if(!errors.isEmpty()){
//     return res.status(400).json({success, errors:errors.array()});
//   }

// try{


//   let user = await Franchiser.findOne({email: req.body.email});
//   if (user) {
//     return res.status(400).json({success,error :"Email already exists"})
//   }

//   const salt = await bcrypt.genSalt(10);
//   const secPass = await  bcrypt.hash(req.body.password,salt);
//   //create new user
//   user = await Franchiser.create({
//     name:req.body.name,
//     password: secPass,
//     email: req.body.email,
//     phoneNumber: req.body.phoneNumber,
//     location: {
//       type: 'Point',
//       coordinates: [req.body.location.coordinates[0], req.body.location.coordinates[1]] // Use provided coordinates
//   }


// })

// const data = {
//   user:{
//     id:user.id
//   }
// }

// const authtoken = jwt.sign(data, JWT_SECRET);
// success =true;
// res.json({success, authtoken})

// }catch(error){
//     console.log(error.message);
//     res.status(500).send("Internal server error");

// }
// })





// router.post('/login', [
//   body('email', 'Enter a valid email').isEmail(),
//   body('password', 'Password cannot be blank').exists(),
// ], async (req,res) => {
   
//    const errors = validationResult(req);
//    if(!errors.isEmpty()){
//      return res.status(400).json({errors:errors.array()});
//    }

//    const {email,password} = req.body;
//    try {
//      let user = await Franchiser.findOne({email});
//      if(!user){
//       return res.status(400).json({error:"Please login with correct credentials"});
//      }


//      const passwordCompare = await bcrypt.compare(password, user.password);
//      if(!passwordCompare){
//       success= false
//       return res.status(400).json({success, error:"Please login with correct credentials"});
//      }

//      const data = {
//       user:{
//         id:user.id
//       }
//     }
    
//     const authtoken = jwt.sign(data, JWT_SECRET);
//     success = true
//     res.json({success, authtoken})
    
//    } catch (error) {
//     console.log(error.message);
//     res.status(500).send("Internal server error");
//    }
 

// })


//otp 
// Route to handle phone number and OTP
router.post('/register', async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Check if the phone number already exists
    let existingFranchiser = await Franchiser.findOne({ phoneNumber });
    
    if (existingFranchiser) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    // Create a new franchiser document
    let franchiser = new Franchiser({ phoneNumber });

    // Save to the database
    await franchiser.save();

    res.status(201).json({ message: 'Franchiser registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// Route to check if there is an OTP against a phone number
router.get('/check/:phoneNumber', async (req, res) => {
  const { phoneNumber } = req.params;

  try {
      const franchiser = await Franchiser.findOne({ phoneNumber });

      if (franchiser) {
          res.status(200).json({ message: 'Registered user', franchiser });
      } else {
          res.status(200).json({ message: 'Not registered user' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
  }
});

router.post('/swap-station', async (req, res) => {
  try {
      const { phoneNumber } = req.body;
      const totalBatteries = 9; 
      const availableBatteries = 9; 

      // Check if the biker with the provided phone number already exists
      let franchiser = await Franchiser.findOne({ phoneNumber});

      // If the biker doesn't exist, create a new record with the phone number
      if (!franchiser) {
          franchiser = new Franchiser({ phoneNumber, totalBatteries, availableBatteries  });
          await franchiser.save();
      }

      return res.status(200).json({ message: 'Franchiser record created/updated successfully' });
  } catch (error) {
      console.error('Error creating/updating franchiser record:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
});

// // GET request to fetch user profile details
// router.get('/profile/:phoneNumber', async (req, res) => {
//   try {
//       const { phoneNumber } = req.params;

//       // Find the biker record by phone number
//       const franchiser = await Franchiser.findOne({ phoneNumber });

//       if (!franchiser ) {
//           return res.status(404).json({ error: 'Franchiser not found' });
//       }

//       // Return only the necessary profile details
//       const userProfile = {
//           phoneNumber:  franchiser.phoneNumber,
//           name:  franchiser.name || '', // Return empty string if name is null
//           email:  franchiser.email || '' // Return empty string if email is null
//       };

//       return res.status(200).json(userProfile);
//   } catch (error) {
//       console.error('Error fetching user profile:', error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // POST request to update user profile details (name, email)
// router.post('/profile/:phoneNumber', async (req, res) => {
//   try {
//       const { phoneNumber } = req.params;
//       const { name, email } = req.body;
//       console.log("Request body" , req.body)
//       // Find the biker record by phone number
//       let  franchiser  = await  Franchiser.findOne({ phoneNumber });

//       if (!franchiser ) {
//           return res.status(404).json({ error: 'Franchiser not found' });
//       }

//       // Update the name and email fields
//       franchiser.name = name;
//       franchiser.email = email;
//       console.log(franchiser.name, franchiser.email)
//       // Save the updated biker record
//       await  franchiser.save();

//       return res.status(200).json({ message: 'User profile updated successfully'});
//   } catch (error) {
//       console.error('Error updating user profile:', error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

router.get('/profile/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        // Find the biker record by phone number
        const franchiser = await Franchiser.findOne({ phoneNumber });

        if (!franchiser) {
            return res.status(404).json({ error: 'franchiser not found' });
        }

        let base64Image = '';
        // Check if profile image exists
        if (franchiser.profileImage) {
            // Read the image file from the uploads folder
            const imagePath = path.join(__dirname, './uploads', franchiser.profileImage);
            const image = fs.readFileSync(imagePath);

            // Convert image data to Base64
            base64Image = Buffer.from(image).toString('base64');
        }

        // Return profile details along with Base64-encoded image data
        const userProfile = {
            phoneNumber: franchiser.phoneNumber,
            name: franchiser.name || '',
            email: franchiser.email || '',
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
        let franchiser = await Franchiser.findOne({ phoneNumber });

        if (!franchiser) {
            return res.status(404).json({ error: 'franchiser not found' });
        }

        // Update the name, email, and image fields
        franchiser.name = name;
        franchiser.email = email;
        if (profileImage) {
            franchiser.profileImage = profileImage;
        }
        console.log(name,email,profileImage)
        // Save the updated biker record
        await franchiser.save();

        return res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// Function to generate a 4-digit OTP containing only numbers
function generateOTP() {
  const otp = Math.floor(1000 + Math.random() * 9000); // Generate a random number between 1000 and 9999
  return otp.toString(); // Convert the number to a string
}
// Route to generate and send OTP via SMS
router.post('/generate-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
  }

  // Generate a 4-digit OTP containing only numbers
  const otp = generateOTP();

  // try {
  //     // Send OTP via SMS
  //     await twilioClient.messages.create({
  //         body: `Your OTP is: ${otp}`,
  //         to: phoneNumber, // user's phone number
  //         from: '+923330319289' // your Twilio phone number
  //     });

  //     // Return success response
  //     return res.json({ message: 'OTP sent successfully' });
  // } catch (error) {
  //     console.error('Error sending OTP:', error);
  //     return res.status(500).json({ error: 'Failed to send OTP' });
  // }

  // Return the generated OTP
  return res.json({ otp });
});

//Register A Battery
// Endpoint to register a new battery
router.post('/registerBattery', async (req, res) => {
  const { franchiserPhoneNumber, battery_number, price, status, batterylevel, mac_address, voltage, capacity, weight, ampere, power } = req.body;

  try {
      // Fetch the franchiser ID based on the phone number
      const franchiser = await Franchiser.findOne({ phoneNumber: franchiserPhoneNumber });
      if (!franchiser) {
          return res.status(404).json({ message: 'Franchiser not found' });
      }

      // Create a new battery entry
      const battery = new Battery({
          battery_number,
          franchiser: franchiser._id,
          price,
          status,
          batterylevel, 
          mac_address,
          capacity,
          voltage,
          ampere,
          weight,
          power


      });
      await battery.save();

      // Update the total and available batteries count of the franchiser
      await Franchiser.findByIdAndUpdate(franchiser._id, { $inc: { availableBatteries: 1 } });

      res.status(200).json({ message: 'Battery registered successfully' });
  } catch (error) {
      console.error('Error registering battery:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

//change battery status
// PUT route to update battery status by ID

// ***********something wrong here aminah 
// router.put('/updateBatteryStatus/:batteryId', async (req, res) => {
//     const { battery_number } = req.params;
//     const { status } = req.body;

//     try {
//         // Find the battery by ID
//         const battery = await Battery.findById(battery_number);
//         if (!battery) {
//             return res.status(404).json({ message: 'Battery not found' });
//         }

//         // Update the battery status
//         battery.status = status;
//         await battery.save();

//         res.status(200).json({ message: 'Battery status updated successfully', battery });
//     } catch (error) {
//         console.error('Error updating battery status:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

/// ************updated one Mussafaraaaa
router.put('/updateBatteryStatus/:batteryId', async (req, res) => {
  const { batteryId } = req.params; 
  console.log("batteryidddddd",batteryId) // Get batteryId from params
  const { status } = req.body;

  try {
      // Find the battery by ID
      const battery = await Battery.findById(batteryId);
     
      if (!battery) {
          return res.status(404).json({ message: 'Battery not found', batteryId });
      }

      // Update the battery status
      battery.status = status;
      await battery.save();

      res.status(200).json({ message: 'Battery status updated successfully', battery });
  } catch (error) {
      console.error('Error updating battery status:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

//Display all batteries of a franchiser
// API endpoint to display all batteries based on franchiser id
router.get('/batteries/:franchiserPhoneNumber', async (req, res) => {
  try {
      const { franchiserPhoneNumber } = req.params;

      // Find franchiser by phone number
      const franchiser = await Franchiser.findOne({ phoneNumber: franchiserPhoneNumber });
      console.log(franchiser)
      if (!franchiser) {
          return res.status(404).json({ error: 'Franchiser not found' });
      }

      // Find batteries associated with the franchiser
      const batteries = await Battery.find({ franchiser: franchiser._id });

      res.status(200).json({ batteries });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to receive name, email, and phone number and generate a token
// router.post('/register', async (req, res) => {
//   try {
//       const { name, email, phoneNumber } = req.body;

//       // Find franchiser by phone number
//       const franchiser = await Franchiser.findOne({ phoneNumber });

//       if (!franchiser) {
//           return res.status(404).json({ error: 'Franchiser not found' });
//       }

//       // Generate JWT token
//       const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

//       // Update franchiser with name, email, token, and is-email-verified flag
//       await franchiser.updateOne({ name, email, token, is_email_verified: 0 });

//       // Send email with token
//       await sendVerificationEmail(email, token);

//       res.status(200).json({ message: 'Verification email sent' });
//   } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Endpoint to verify email by token
router.get('/verify-email/:token', async (req, res) => {
  try {
      const token = req.params.token;

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Find franchiser by decoded email
      const franchiser = await Franchiser.findOne({ email: decoded.email });

      if (!franchiser) {
          return res.status(404).json({ error: 'Franchiser not found' });
      }

      // Update franchiser's is-email-verified flag to true
      await franchiser.updateOne({ is_email_verified: 1 });

      res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to send verification email
async function sendVerificationEmail(email, token) {
  // Create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
      // Your email SMTP configuration here
      service: 'Gmail',
      auth: {
          user: 'aminah30akhtar3a@gmail.com', // Your Gmail email address
          pass: 'rekk zctd wual aepq' //app password
      },
      tls: {
          rejectUnauthorized: false // Trust self-signed certificate
      }
  });

  // Send mail with defined transport object
  let info = await transporter.sendMail({
      from: '"BSHM - Email Verification" <aminah30akhtar3a@gmail.com>',
      to: email,
      subject: 'Email Verification',
      text: `Please click the following link to verify your email: http://localhost:5000/api/franchiser/verify-email/${token}`,
      html: `<h4 style="color: black;">Welcome User, <br>
      Thank you for registering at BSHM (Battery Swapping And Health Monitoring Application)</h4>
      <p style="color: black;">Please click the following link to verify your email: <a href="http://localhost:5000/api/franchiser/verify-email/${token}">Verify Email</a></p>`
  });

  console.log('Message sent: %s', info.messageId);
}

router.get('/check-email-verification', async (req, res) => {
  try {
      const { email } = req.query;

      if (!email) {
          return res.status(400).json({ error: 'Email is required' });
      }

      // Access database to check is_email_verified
      const franchiser = await Franchiser.findOne({ email });

      if (!franchiser) {
          return res.status(404).json({ error: 'Franchiser not found' });
      }

      if (franchiser.is_email_verified === 0) {
          return res.status(400).json({ message: 'Please verify email' });
      } else {
          return res.status(200).json({ message: 'Email verified' });
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// View all received swap requests for a franchiser
router.get('/view-all-request/:franchiserPhoneNumber', async (req, res) => {
    try {
        const { franchiserPhoneNumber } = req.params;
  
        // Find franchiser by phone number
        const franchiser = await Franchiser.findOne({ phoneNumber: franchiserPhoneNumber });
        if (!franchiser) {
            return res.status(404).json({ error: 'Franchiser not found' });
        }
  
        // Find all swap requests associated with the franchiser ID
        const swapRequests = await SwapRequest.find({ franchiser: franchiser._id })
            .populate('biker', 'name phoneNumber') // Populate biker name and phoneNumber
            .populate('battery', 'battery_number'); // Populate battery battery_number
  
        // Map over swapRequests to format the response with required details
        const formattedSwapRequests = swapRequests.map(request => ({
            _id: request._id,
            bikerName: request.biker ? request.biker.name : 'Unknown',
            bikerPhoneNumber: request.biker ? request.biker.phoneNumber : 'Unknown',
            franchiserName: franchiser.name,
            batteryNumber: request.battery ? request.battery.battery_number : 'Unknown',
            request: request.request,
            amount: request.amount,
            batteryStatus: request.batteryStatus,
            datetime: request.datetime,
        }));
  
        res.status(200).json({ swapRequests: formattedSwapRequests });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });
// router.put('/accept-swap-request/:swapRequestId', async (req, res) => {
//   try {
//       const { swapRequestId } = req.params;

//       // Find the swap request by ID
//       const swapRequest = await SwapRequest.findById(swapRequestId);

//       if (!swapRequest) {
//           return res.status(404).json({ error: 'Swap request not found' });
//       }

//       // Update the swap request status to "accepted"
//       swapRequest.request = 'accepted';
//       swapRequest.batteryStatus = 'reserved';
//       await swapRequest.save();

//       // Get the franchiser ID from the swap request
//       const franchiserId = swapRequest.franchiser;

//       // Deduct one from the availableBatteries field of the associated franchiser
//       const franchiser = await Franchiser.findById(franchiserId);
//       if (!franchiser) {
//           return res.status(404).json({ error: 'Franchiser not found' });
//       }
//       franchiser.availableBatteries -= 1;
//       await franchiser.save();

//       res.status(200).json({ message: 'Swap request status updated to accepted', batteryStatus: 'reserved' });
//   } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//   }
// });
// router.put('/reject-swap-request/:swapRequestId', async (req, res) => {
//   try {
//       const { swapRequestId } = req.params;

//       // Find the swap request by ID
//       const swapRequest = await SwapRequest.findById(swapRequestId);

//       if (!swapRequest) {
//           return res.status(404).json({ error: 'Swap request not found' });
//       }

//       // Update the swap request status to "accepted"
//       swapRequest.request = 'rejected';
//       await swapRequest.save();

//       res.status(200).json({ message: 'Swap request status updated to rejected' });
//   } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//   }
// });



router.put('/accept-swap-request-socket/:swapRequestId', async (req, res) => {
    try {
        const { swapRequestId } = req.params;
  
        // Find the swap request by ID
        const swapRequest = await SwapRequest.findById(swapRequestId);
  
        if (!swapRequest) {
            return res.status(404).json({ error: 'Swap request not found' });
        }
  
        // Update the swap request status to "accepted"
        swapRequest.request = 'accepted';
        swapRequest.batteryStatus = 'reserved';
        await swapRequest.save();
  
        // Get the franchiser ID from the swap request
        const franchiserId = swapRequest.franchiser;
  
        // Deduct one from the availableBatteries field of the associated franchiser
        const franchiser = await Franchiser.findById(franchiserId);
        if (!franchiser) {
            return res.status(404).json({ error: 'Franchiser not found' });
        }
        franchiser.availableBatteries -= 1;
        await franchiser.save();
        
        // Emit event to notify the biker
        const io = req.app.get('io');
        io.emit('swapRequestAccepted', {franchiserName: franchiser.name, franchiserPhoneNumber: franchiser.phoneNumber});
  
        res.status(200).json({ message: 'Swap request status updated to accepted', batteryStatus: 'swapped',franchiserName: franchiser.name, franchiserPhoneNumber: franchiser.phoneNumber });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/reject-swap-request-socket/:swapRequestId', async (req, res) => {
    try {
        const { swapRequestId } = req.params;
  
        // Find the swap request by ID
        const swapRequest = await SwapRequest.findById(swapRequestId);
  
        if (!swapRequest) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        // Get the franchiser ID from the swap request
        const franchiserId = swapRequest.franchiser;
  
        // Update the swap request status to "accepted"
        swapRequest.request = 'rejected';
        await swapRequest.save();

        // Fetch the franchiser details
        const franchiser = await Franchiser.findById(franchiserId);
        if (!franchiser) {
            return res.status(404).json({ error: 'Franchiser not found' });
        }

         // Emit event to notify the biker
         const io = req.app.get('io');
         io.emit('swapRequestRejected', {franchiserName: franchiser.name, franchiserPhoneNumber: franchiser.phoneNumber});
  
        res.status(200).json({ message: 'Swap request status updated to rejected',batteryStatus: 'unswapped', franchiserName: franchiser.name, franchiserPhoneNumber: franchiser.phoneNumber });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Endpoint to store latitude and longitude values of a biker based on email
router.post('/store-location', async (req, res) => {
    const { phoneNumber, latitude, longitude } = req.body;
  
    try {
      // Find the biker based on the provided email
      const franchiser = await Franchiser.findOne({ phoneNumber });
  
      if (!franchiser) {
        return res.status(404).json({ error: 'Franchiser with provided phoneNumber not found' });
      }
  
      // Update the location coordinates of the biker
      franchiser.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
  
      // Save the updated biker document
      await franchiser.save();
  
      return res.status(200).json({ message: 'Location stored successfully' });
    } catch (error) {
      console.error('Error storing biker location:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
module.exports = router