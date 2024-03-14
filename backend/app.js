const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const storageReference = require("./lib/firebase");
const port = 9000;

const app = express();
app.use(cors());

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specific HTTP methods
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
//   next();
// });

mongoose.connect('mongodb+srv://adibala1306:AdiHari9$@cluster0.ouneyo6.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));
  
const imageSchema = new mongoose.Schema({
  name: String,
  url: String
});

const logoSchema = new mongoose.Schema({
  name: String,
  url: String
})

const Image = mongoose.model('Image', imageSchema);
const Logo = mongoose.model('Logo', logoSchema);

let imageCount = 1;


const upload = multer({ storage: multer.memoryStorage() });

// Endpoint for uploading images
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
      const fileBuffer = req.file.buffer;
      const fileReference = storageReference.child(`images/${Date.now() + ' ' + req.file.originalname}`);
      await fileReference.put(fileBuffer, { contentType: 'image/png' });
      const fileDownloadURL = await fileReference.getDownloadURL();

      const newImage = new Image({
          name: req.file.originalname,
          url: fileDownloadURL
      });

      await newImage.save();
      res.send('Image uploaded successfully.');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading image.');
  }
});

app.get('/carousel-images', async (req, res) => {
  let pic = await Image.find({});

  const urls = pic.map(item => item.url);

  res.status(200).json({
    img : urls
  })
});

// Endpoint for uploading logos
app.post('/logoupload', upload.single('image'), async (req, res) => {
  try {
      const fileBuffer = req.file.buffer;
      const fileReference = storageReference.child(`logos/${Date.now() + ' ' + req.file.originalname}`);
      await fileReference.put(fileBuffer, { contentType: 'image/png' });
      const fileDownloadURL = await fileReference.getDownloadURL();

      const newLogo = new Logo({
          name: req.file.originalname,
          url: fileDownloadURL
      });

      await newLogo.save();
      res.send('Image uploaded successfully.');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading image.');
  }
});

app.get('/logos', async (req,res) => {
  let logoPic = await Logo.find({});

  let urls = logoPic.map(i => i.url);

  res.status(200).json({
    urls
  })
});


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const startupSchema = new mongoose.Schema({
  name: String,
  type: String
});

app.use(express.json());
app.use(cors());

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
      let user = await User.findOne({ email });
      if (user) {
          return res.status(400).json({ message: 'User already exists' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
          email,
          password: hashedPassword
      });

      await user.save();

      const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '3h' });
      res.json({ token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Validate password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '3h' });

  res.json({ 
    message : 'success',
    token 
  });
});

// Assuming you have required modules and setup database connection

app.post('/addstartups', async (req, res) => {
  try {
    const startupData = req.body; 
    const result = await Startup.insertMany(startupData);

    res.status(201).json({
      message: `${result.length} startups added successfully`
    });
  } catch (error) {
    console.error('Error adding data:', error);
    res.status(500).send('Error adding data');
  }
});

app.get('/getdpiit', async (req,res) => {
  try{
    let dpiit = await Startup.find({"type" : "DPIIT"});

    res.status(200).json({
      dpiit
    })
  }catch(error){
    res.status(500).json({
      message: "Fetch unsuccessful"
    })
  }
});

app.get('/getnondpiit', async (req,res) => {
  try {
    let nondpiit = await Startup.find({ "type" : "Non DPIIT"});

    res.status(200).json({
      nondpiit
    })
  }catch(error) {
    res.status(500).json({
      message : "Fetch unsuccessful"
    })
  }
});

// Add Projects

const projectSchema = new mongoose.Schema({
  id: Number,
  name: String,
  desc: String,
  image: String
});

const Project = mongoose.model('Project',projectSchema);

app.post('/projectimage', upload.single('image'), async (req, res) => {
  try {
      const fileBuffer = req.file.buffer;
      const fileReference = storageReference.child(`project/${Date.now() + ' ' + req.file.originalname}`);
      await fileReference.put(fileBuffer, { contentType: 'image/png' });
      const fileDownloadURL = await fileReference.getDownloadURL();
      res.json({
        url: fileDownloadURL
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading image.');
  }
});

app.post('/addprojects', async (req,res) => {
  let id;
  let existingProjects = await Project.find({});

  if(existingProjects.length > 0){
    id = existingProjects.slice(-1)[0].id + 1;
  }else{
    id = 1;
  }

  const project = new Project({
    id,
    name : req.body.name,
    desc : req.body.desc,
    image : req.body.image
  });

  const add = await project.save();

  res.status(200).json({
    message: `Project ${id} added successfully`,
    add
  })
});

app.get('/getprojects', async (req,res) => {
  const proj = await Project.find({});

  res.status(200).json({
    proj
  })
});

// Routes for deletion

app.delete('/removestartup', async (req,res) => {
  const startup = req.body.name;

  await Startup.deleteOne({ name : startup });

  res.status(200).json({
    status: 'deleted'
  })
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'secret', (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
}

// Example protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

const User = mongoose.model('User', userSchema);
const Startup = mongoose.model('Startup',startupSchema);

app.listen(9000, () => {
    console.log('Server is running on port 9000');
});
