const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// View and download limit configuration
const viewLimit = 1;
const downloadLimit = 1;

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  viewHistory: [{
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    watchedAt: { type: Date, default: Date.now },
    duration: { type: Number }, // in seconds
    completed: { type: Boolean, default: false }
  }],
  downloadHistory: [{
    downloadUrl: { type: String, required: true },
    downloadedAt: { type: Date, default: Date.now }
  }],
  preferences: {
    favoriteSubjects: [String],
    playbackSpeed: { type: Number, default: 1.0 },
    quality: { type: String, default: 'auto' }
  }
});

const User = mongoose.model('User', userSchema);

// Video Schema and Model
const videoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subjects: [String],
  date: { type: Date, required: true },
  duration: { type: String },
  thumbnail: { type: String },
  instructor: { type: String },
  isNew: { type: Boolean, default: false },
  description: { type: String },
  tags: [String],
  googleDriveLink: { type: String, required: true },
  viewCount: { type: Number, default: 0 }
});

const Video = mongoose.model('Video', videoSchema);

// Metadata Schema and Model
const metadataSchema = new mongoose.Schema({
  availableSubjects: [String],
  availableDates: [String],
  subjectThumbnails: [{
    subject: { type: String, required: true },
    thumbnail: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

const Metadata = mongoose.model('Metadata', metadataSchema);

// ActiveSessions Schema and Model
const activeSessionsSchema = new mongoose.Schema({
  activeViewSessions: { type: Number, default: 0 },
  activeDownloadSessions: { type: Number, default: 0 }
});

const ActiveSessions = mongoose.model('activesessions', activeSessionsSchema);

// Waitlist Schema and Model
const waitlistSchema = new mongoose.Schema({
  viewWaitNumber: { type: Number, default: 0 },
  viewUserQueue: { type: Array, default: [] },
  downloadWaitNumber: { type: Number, default: 0 },
  downloadUserQueue: { type: Array, default: [] }
});

const Waitlist = mongoose.model('waitlist', waitlistSchema);

// Helper function to initialize ActiveSessions
const initializeActiveSessions = async () => {
  try {
    let activeSessions = await ActiveSessions.findOne();
    
    if (!activeSessions) {
      // Create initial ActiveSessions document if it doesn't exist
      activeSessions = new ActiveSessions({
        activeViewSessions: 0,
        activeDownloadSessions: 0
      });
      await activeSessions.save();
    }
    
    return activeSessions;
  } catch (error) {
    console.error('Failed to initialize ActiveSessions:', error);
    return null;
  }
};

// Helper function to initialize Waitlist
const initializeWaitlist = async () => {
  try {
    let waitlist = await Waitlist.findOne();
    
    if (!waitlist) {
      // Create initial Waitlist document if it doesn't exist
      waitlist = new Waitlist({
        viewWaitNumber: 0,
        viewUserQueue: [],
        downloadWaitNumber: 0,
        downloadUserQueue: []
      });
      await waitlist.save();
    }
    
    return waitlist;
  } catch (error) {
    console.error('Failed to initialize Waitlist:', error);
    return null;
  }
};

// Helper function to update metadata
const updateMetadata = async (newSubjects, newDate) => {
  try {
    let metadata = await Metadata.findOne();
    
    if (!metadata) {
      // Create initial metadata if it doesn't exist
      metadata = new Metadata({
        availableSubjects: [...newSubjects],
        availableDates: [newDate],
        lastUpdated: new Date()
      });
    } else {
      // Update existing metadata
      newSubjects.forEach(subject => {
        if (!metadata.availableSubjects.includes(subject)) {
          metadata.availableSubjects.push(subject);
        }
      });
      
      if (!metadata.availableDates.includes(newDate)) {
        metadata.availableDates.push(newDate);
      }
      
      metadata.lastUpdated = new Date();
    }
    
    await metadata.save();
  } catch (error) {
    console.error('Failed to update metadata:', error);
  }
};

// Authentication Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = new User({
      email,
      name,
      password: hashedPassword,
      role: email === 'akashdeepsengupta42@gmail.com' ? 'admin' : 'user'
    });
    
    await user.save();
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy'
  });
});

// Get all videos
app.get('/api/videos', async (req, res) => {
  try {
    const { subject, search, limit = 50, offset = 0 } = req.query;
    let query = {};
    
    if (subject && subject !== 'All Subjects') {
      query.subject = subject;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }
    
    const videos = await Video.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile with view history
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update user
app.post('/api/user', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    let user = await User.findOne({ email });
    
    if (user) {
      user.name = name;
      await user.save();
    } else {
      user = new User({ email, name });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add video to user's view history
app.post('/api/user/:email/view-history', authenticateToken, async (req, res) => {
  try {
    const { videoId, title, subject, duration, completed } = req.body;
    
    // Verify user can only modify their own history
    if (req.user.email !== req.params.email && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { 
        $push: { 
          viewHistory: {
            videoId,
            title,
            subject,
            duration,
            completed,
            watchedAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );
    
    // Increment video view count
    await Video.findOneAndUpdate(
      { id: videoId },
      { $inc: { viewCount: 1 } }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add video to user's download history
app.post('/api/user/:email/download-history', authenticateToken, async (req, res) => {
  try {
    const { videoId, title, subject, fileSize, format } = req.body;
    
    // Verify user can only modify their own history
    if (req.user.email !== req.params.email && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { 
        $push: { 
          downloadHistory: {
            videoId,
            title,
            subject,
            fileSize,
            format,
            downloadedAt: new Date()
          }
        }
      },
      { new: true }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's view history
app.get('/api/user/:email/view-history', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.viewHistory.sort((a, b) => b.watchedAt - a.watchedAt));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new video (Admin only)
app.post('/api/videos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { googleDriveLink, subjects, title, date } = req.body;
    
    // Generate unique ID
    const videoId = new Date().getTime().toString();
    
    const video = new Video({
      id: videoId,
      title,
      subjects: subjects || [],
      date: new Date(date),
      duration: '1:30:00', // Default duration
      thumbnail: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=800&q=80`, // Default thumbnail
      instructor: 'FramePulse Instructor', // Default instructor
      description: '', // Empty description
      tags: [], // Empty tags array
      googleDriveLink,
      isNew: true
    });
    
    await video.save();
    
    // Update metadata with new subjects and date
    await updateMetadata(subjects || [], date);
    
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update video (Admin only)
app.put('/api/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const video = await Video.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete video (Admin only)
app.delete('/api/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const video = await Video.findOneAndDelete({ id: req.params.id });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get server statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalViews = await Video.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    
    res.json({
      totalVideos,
      totalUsers,
      totalViews: totalViews[0]?.totalViews || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get metadata for filters
app.get('/api/metadata', async (req, res) => {
  try {
    let metadata = await Metadata.findOne();
    
    if (!metadata) {
      // Create initial metadata if it doesn't exist
      metadata = new Metadata({
        availableSubjects: ['AI', 'Network', 'Python', 'LMS Orientation'],
        availableDates: ['today', 'week', 'month', 'year'],
        subjectThumbnails: [
          { subject: 'AI', thumbnail: 'https://www.lockheedmartin.com/content/dam/lockheed-martin/eo/photo/ai-ml/artificial-intelligence-1920.jpg', createdAt: new Date() },
          { subject: 'Network', thumbnail: 'https://cdn.slidesharecdn.com/ss_thumbnails/chinkey-200821151313-thumbnail.jpg?width=640&height=640&fit=bounds', createdAt: new Date() },
          { subject: 'Python', thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*Acz2aMKGEqOmywuX8lFO8A.jpeg', createdAt: new Date() },
          { subject: 'LMS Orientation', thumbnail: 'https://www.techasoft.com/blog/2021/01/1609606508.png', createdAt: new Date() }
        ],
        lastUpdated: new Date()
      });
      await metadata.save();
    }
    
    // Format dates for display
    const formattedDates = metadata.availableDates.map(date => {
      const videoDate = new Date(date)
      const formattedVideoDate = `${videoDate.getDate().toString().padStart(2, '0')}-${(videoDate.getMonth() + 1).toString().padStart(2, '0')}-${videoDate.getFullYear()}`
      return formattedVideoDate
    });
    
    res.json({
      subjects: ['All Subjects', ...metadata.availableSubjects],
      dates: ['All Time', ...formattedDates],
      subjectThumbnails: metadata.subjectThumbnails,
      lastUpdated: metadata.lastUpdated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or update subject-thumbnail pair
app.post('/api/admin/subject-thumbnail', authenticateToken, async (req, res) => {
  try {
    const { subject, thumbnail } = req.body;
    
    if (!subject || !thumbnail) {
      return res.status(400).json({ error: 'Subject and thumbnail are required' });
    }
    
    let metadata = await Metadata.findOne();
    
    if (!metadata) {
      metadata = new Metadata({ subjectThumbnails: [] });
    }
    
    // Remove existing entry for this subject
    metadata.subjectThumbnails = metadata.subjectThumbnails.filter(item => item.subject !== subject);
    
    // Add new entry
    metadata.subjectThumbnails.push({
      subject,
      thumbnail,
      createdAt: new Date()
    });
    
    metadata.lastUpdated = new Date();
    await metadata.save();
    
    res.json({ success: true, message: 'Subject-thumbnail pair added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ActiveSessions data
app.get('/api/active-sessions', async (req, res) => {
  try {
    let activeSessions = await ActiveSessions.findOne();
    
    if (!activeSessions) {
      // Initialize if doesn't exist
      activeSessions = await initializeActiveSessions();
    }
    
    res.json({
      activeViewSessions: activeSessions?.activeViewSessions || 0,
      activeDownloadSessions: activeSessions?.activeDownloadSessions || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ActiveSessions data
app.put('/api/active-sessions', async (req, res) => {
  try {
    const { activeViewSessions, activeDownloadSessions } = req.body;
    
    let activeSessions = await ActiveSessions.findOne();
    
    if (!activeSessions) {
      // Initialize if doesn't exist
      activeSessions = await initializeActiveSessions();
    }
    
    // Update fields if provided
    if (typeof activeViewSessions === 'number') {
      activeSessions.activeViewSessions = activeViewSessions;
    }
    
    if (typeof activeDownloadSessions === 'number') {
      activeSessions.activeDownloadSessions = activeDownloadSessions;
    }
    
    await activeSessions.save();
    
    res.json({
      success: true,
      activeViewSessions: activeSessions.activeViewSessions,
      activeDownloadSessions: activeSessions.activeDownloadSessions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment ActiveSessions counters
app.post('/api/active-sessions/increment', async (req, res) => {
  try {
    const { type } = req.body; // 'view' or 'download'
    
    if (!type || (type !== 'view' && type !== 'download')) {
      return res.status(400).json({ error: 'Type must be "view" or "download"' });
    }
    
    let activeSessions = await ActiveSessions.findOne();
    
    if (!activeSessions) {
      // Initialize if doesn't exist
      activeSessions = await initializeActiveSessions();
    }
    
    // Increment appropriate counter
    if (type === 'view') {
      activeSessions.activeViewSessions += 1;
    } else if (type === 'download') {
      activeSessions.activeDownloadSessions += 1;
    }
    
    await activeSessions.save();
    
    res.json({
      success: true,
      activeViewSessions: activeSessions.activeViewSessions,
      activeDownloadSessions: activeSessions.activeDownloadSessions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decrement ActiveSessions counters
app.post('/api/active-sessions/decrement', async (req, res) => {
  try {
    const { type } = req.body; // 'view' or 'download'
    
    if (!type || (type !== 'view' && type !== 'download')) {
      return res.status(400).json({ error: 'Type must be "view" or "download"' });
    }
    
    let activeSessions = await ActiveSessions.findOne();
    
    if (!activeSessions) {
      // Initialize if doesn't exist
      activeSessions = await initializeActiveSessions();
    }
    
    // Decrement appropriate counter (but not below 0)
    if (type === 'view' && activeSessions.activeViewSessions > 0) {
      activeSessions.activeViewSessions -= 1;
    } else if (type === 'download' && activeSessions.activeDownloadSessions > 0) {
      activeSessions.activeDownloadSessions -= 1;
    }
    
    await activeSessions.save();
    
    res.json({
      success: true,
      activeViewSessions: activeSessions.activeViewSessions,
      activeDownloadSessions: activeSessions.activeDownloadSessions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decrement view sessions for tab close (single request for beacon)
app.post('/api/active-sessions/decrement-view', async (req, res) => {
  try {
    let activeSessions = await ActiveSessions.findOne();
    
    if (!activeSessions) {
      // Initialize if doesn't exist
      activeSessions = await initializeActiveSessions();
    }
    
    // Decrement view sessions (but not below 0)
    if (activeSessions.activeViewSessions > 0) {
      activeSessions.activeViewSessions -= 1;
    }
    
    await activeSessions.save();
    
    res.json({
      success: true,
      activeViewSessions: activeSessions.activeViewSessions,
      activeDownloadSessions: activeSessions.activeDownloadSessions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decrement active view sessions (for beacon requests)
app.post('/api/active-sessions/decrement-view', async (req, res) => {
  try {
    let activeSessions = await ActiveSessions.findOne();
    
    if (!activeSessions) {
      // Initialize if doesn't exist
      activeSessions = await initializeActiveSessions();
    }
    
    // Decrement activeViewSessions
    activeSessions.activeViewSessions = Math.max(0, activeSessions.activeViewSessions - 1);
    await activeSessions.save();
    
    res.json({ success: true, activeViewSessions: activeSessions.activeViewSessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decrement active download sessions (for beacon requests)
app.post('/api/active-sessions/decrement-download', async (req, res) => {
  try {
    let activeSessions = await ActiveSessions.findOne();
    
    if (!activeSessions) {
      // Initialize if doesn't exist
      activeSessions = await initializeActiveSessions();
    }
    
    // Decrement activeDownloadSessions
    activeSessions.activeDownloadSessions = Math.max(0, activeSessions.activeDownloadSessions - 1);
    await activeSessions.save();
    
    res.json({ success: true, activeDownloadSessions: activeSessions.activeDownloadSessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get waitlist data
app.get('/api/waitlist', async (req, res) => {
  try {
    let waitlist = await Waitlist.findOne();
    
    if (!waitlist) {
      // Initialize if doesn't exist
      waitlist = await initializeWaitlist();
    }
    
    res.json({
      viewWaitNumber: waitlist?.viewWaitNumber || 0,
      viewUserQueue: waitlist?.viewUserQueue || [],
      downloadWaitNumber: waitlist?.downloadWaitNumber || 0,
      downloadUserQueue: waitlist?.downloadUserQueue || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add user to waitlist
app.post('/api/waitlist/add', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    let waitlist = await Waitlist.findOne();
    
    if (!waitlist) {
      // Initialize if doesn't exist
      waitlist = await initializeWaitlist();
    }
    
    // Check if user is already in view queue
    if (waitlist.viewUserQueue.includes(email)) {
      return res.status(400).json({ error: 'User already in view waitlist' });
    }
    
    // Add user to view queue and increment view wait number
    waitlist.viewUserQueue.push(email);
    waitlist.viewWaitNumber += 1;
    
    await waitlist.save();
    
    res.json({
      success: true,
      viewWaitNumber: waitlist.viewWaitNumber,
      viewUserQueue: waitlist.viewUserQueue,
      yourPosition: waitlist.viewUserQueue.indexOf(email) + 1,
      downloadWaitNumber: waitlist.downloadWaitNumber,
      downloadUserQueue: waitlist.downloadUserQueue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove user from waitlist
app.post('/api/waitlist/remove', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    let waitlist = await Waitlist.findOne();
    
    if (!waitlist) {
      // Initialize if doesn't exist
      waitlist = await initializeWaitlist();
    }
    
    // Remove all occurrences of user from view queue
    const initialViewLength = waitlist.viewUserQueue.length;
    waitlist.viewUserQueue = waitlist.viewUserQueue.filter(userEmail => userEmail !== email);
    
    // Update view wait number based on how many elements were removed
    const viewRemovedCount = initialViewLength - waitlist.viewUserQueue.length;
    if (viewRemovedCount > 0) {
      waitlist.viewWaitNumber = Math.max(0, waitlist.viewWaitNumber - viewRemovedCount);
    }
    
    await waitlist.save();
    
    res.json({
      success: true,
      viewWaitNumber: waitlist.viewWaitNumber,
      viewUserQueue: waitlist.viewUserQueue,
      downloadWaitNumber: waitlist.downloadWaitNumber,
      downloadUserQueue: waitlist.downloadUserQueue,
      removedCount: viewRemovedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user is allowed to watch (without processing queue)
app.get('/api/waitlist/check-allowed/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    let waitlist = await Waitlist.findOne();
    
    if (!waitlist) {
      // Initialize if doesn't exist
      waitlist = await initializeWaitlist();
    }
    
    // Check if user is first in view queue
    const isFirstInViewQueue = waitlist.viewUserQueue.length > 0 && waitlist.viewUserQueue[0] === email;
    
    res.json({
      success: true,
      isAllowed: isFirstInViewQueue,
      viewUserQueue: waitlist.viewUserQueue,
      viewWaitNumber: waitlist.viewWaitNumber,
      downloadWaitNumber: waitlist.downloadWaitNumber,
      downloadUserQueue: waitlist.downloadUserQueue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process queue (remove first user and decrement wait number)
app.post('/api/waitlist/process', async (req, res) => {
  try {
    let waitlist = await Waitlist.findOne();
    
    if (!waitlist) {
      // Initialize if doesn't exist
      waitlist = await initializeWaitlist();
    }
    
    let allowedUser = null;
    
    // Only remove first user if view queue has users
    if (waitlist.viewUserQueue.length > 0) {
      allowedUser = waitlist.viewUserQueue.shift();
      waitlist.viewWaitNumber = Math.max(0, waitlist.viewWaitNumber - 1);
    }
    
    await waitlist.save();
    
    res.json({
      success: true,
      allowedUser,
      viewWaitNumber: waitlist.viewWaitNumber,
      viewUserQueue: waitlist.viewUserQueue,
      downloadWaitNumber: waitlist.downloadWaitNumber,
      downloadUserQueue: waitlist.downloadUserQueue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add user to download waitlist
app.post('/api/download-waitlist/add', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    let waitlist = await Waitlist.findOne();
    
    if (!waitlist) {
      // Initialize if doesn't exist
      waitlist = await initializeWaitlist();
    }
    
    // Check if user is already in download queue
    if (waitlist.downloadUserQueue.includes(email)) {
      return res.status(400).json({ error: 'User already in download waitlist' });
    }
    
    // Add user to download queue and increment download wait number
    waitlist.downloadUserQueue.push(email);
    waitlist.downloadWaitNumber += 1;
    
    await waitlist.save();
    
    res.json({
      success: true,
      downloadWaitNumber: waitlist.downloadWaitNumber,
      downloadUserQueue: waitlist.downloadUserQueue,
      yourPosition: waitlist.downloadUserQueue.indexOf(email) + 1,
      viewWaitNumber: waitlist.viewWaitNumber,
      viewUserQueue: waitlist.viewUserQueue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove user from download waitlist
app.post('/api/download-waitlist/remove', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    let waitlist = await Waitlist.findOne();
    
    if (!waitlist) {
      // Initialize if doesn't exist
      waitlist = await initializeWaitlist();
    }
    
    // Remove all occurrences of user from download queue
    const initialDownloadLength = waitlist.downloadUserQueue.length;
    waitlist.downloadUserQueue = waitlist.downloadUserQueue.filter(userEmail => userEmail !== email);
    
    // Update download wait number based on how many elements were removed
    const downloadRemovedCount = initialDownloadLength - waitlist.downloadUserQueue.length;
    if (downloadRemovedCount > 0) {
      waitlist.downloadWaitNumber = Math.max(0, waitlist.downloadWaitNumber - downloadRemovedCount);
    }
    
    await waitlist.save();
    
    res.json({
      success: true,
      downloadWaitNumber: waitlist.downloadWaitNumber,
      downloadUserQueue: waitlist.downloadUserQueue,
      viewWaitNumber: waitlist.viewWaitNumber,
      viewUserQueue: waitlist.viewUserQueue,
      removedCount: downloadRemovedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process download queue (remove first user and decrement download wait number)
app.post('/api/download-waitlist/process', async (req, res) => {
  try {
    let waitlist = await Waitlist.findOne();
    
    if (!waitlist) {
      // Initialize if doesn't exist
      waitlist = await initializeWaitlist();
    }
    
    let allowedUser = null;
    
    // Only remove first user if download queue has users
    if (waitlist.downloadUserQueue.length > 0) {
      allowedUser = waitlist.downloadUserQueue.shift();
      waitlist.downloadWaitNumber = Math.max(0, waitlist.downloadWaitNumber - 1);
    }
    
    await waitlist.save();
    
    res.json({
      success: true,
      allowedUser,
      downloadWaitNumber: waitlist.downloadWaitNumber,
      downloadUserQueue: waitlist.downloadUserQueue,
      viewWaitNumber: waitlist.viewWaitNumber,
      viewUserQueue: waitlist.viewUserQueue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track user watch history
app.post('/api/user/watch-history', authenticateToken, async (req, res) => {
  try {
    const { videoId, title, subject, watchedAt } = req.body;
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add to watch history (remove duplicates, keep latest)
    user.viewHistory = user.viewHistory.filter(item => item.videoId !== videoId);
    user.viewHistory.unshift({
      videoId,
      title,
      subject,
      watchedAt: new Date(watchedAt)
    });

    // Keep only last 50 items
    if (user.viewHistory.length > 50) {
      user.viewHistory = user.viewHistory.slice(0, 50);
    }

    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track user download history
app.post('/api/user/download-history', authenticateToken, async (req, res) => {
  try {
    const { downloadUrl, downloadedAt } = req.body;
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add to download history (remove duplicates, keep latest)
    user.downloadHistory = user.downloadHistory.filter(item => item.downloadUrl !== downloadUrl);
    user.downloadHistory.unshift({
      downloadUrl,
      downloadedAt: new Date(downloadedAt)
    });

    // Keep only last 50 items
    if (user.downloadHistory.length > 50) {
      user.downloadHistory = user.downloadHistory.slice(0, 50);
    }

    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete and recreate waitlist collection
const recreateWaitlistCollection = async () => {
  try {
    // Drop existing collection
    await Waitlist.deleteMany({});
    console.log('Existing waitlist collection deleted');
    
    // Create new waitlist document with updated schema
    await initializeWaitlist();
    console.log('New waitlist collection created with wait field');
  } catch (error) {
    console.error('Error recreating waitlist collection:', error);
  }
};

// Initialize collections on server startup
const initializeCollections = async () => {
  try {
    // Initialize ActiveSessions collection
    await initializeActiveSessions();
    console.log('ActiveSessions collection initialized');
    
    // Recreate Waitlist collection with new schema
    await recreateWaitlistCollection();
    
    // Initialize Metadata collection if needed
    let metadata = await Metadata.findOne();
    if (!metadata) {
      metadata = new Metadata({
        availableSubjects: ['AI', 'Network', 'Python', 'LMS Orientation'],
        availableDates: ['today', 'week', 'month', 'year'],
        subjectThumbnails: [
          { subject: 'AI', thumbnail: 'https://www.lockheedmartin.com/content/dam/lockheed-martin/eo/photo/ai-ml/artificial-intelligence-1920.jpg', createdAt: new Date() },
          { subject: 'Network', thumbnail: 'https://cdn.slidesharecdn.com/ss_thumbnails/chinkey-200821151313-thumbnail.jpg?width=640&height=640&fit=bounds', createdAt: new Date() },
          { subject: 'Python', thumbnail: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*Acz2aMKGEqOmywuX8lFO8A.jpeg', createdAt: new Date() },
          { subject: 'LMS Orientation', thumbnail: 'https://www.techasoft.com/blog/2021/01/1609606508.png', createdAt: new Date() }
        ],
        lastUpdated: new Date()
      });
      await metadata.save();
      console.log('Metadata collection initialized');
    }
    
    console.log('All collections initialized successfully');
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeCollections();
});

module.exports = app;
