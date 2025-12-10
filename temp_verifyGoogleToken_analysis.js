const verifyGoogleToken = async (req, res) => {
  const { _id, email, name, photo, googleId } = req.body;
  
  console.log('Google auth request:', { _id, email, name, photo, googleId });
  
  try {
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('Creating new user with _id:', _id);
      
      // Generate unique username from email if name is not provided
      let username = name || email.split('@')[0];
      let counter = 1;
      let originalUsername = username;
      
      // Ensure username is unique
      while (await User.findOne({ name: username })) {
        username = `${originalUsername}${counter}`;
        counter++;
      }

      user = new User({ 
        _id, 
        email, 
        name: username, 
        photo, 
        googleId,
        platforms: [],
        friends: [],
        friendRequests: [],
        pendingFriends: [],
        currentStreaks: { leetcode: 0 },
        longestStreaks: { leetcode: 0 },
        lastUpdated: { leetcode: new Date() },
      });
      await user.save();
      console.log('User created successfully with username:', username);
    } else {
      // Update Google ID if not present
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        await user.save();
      }
      
      // Update name if not set
      if (!user.name && name) {
        // Generate unique username from name
        let username = name;
        let counter = 1;
        let originalUsername = username;
        
        // Ensure username is unique
        while (await User.findOne({ name: username, _id: { $ne: user._id } })) {
          username = `${originalUsername}${counter}`;
          counter++;
        }
        
        user.name = username;
        await user.save();
        console.log('Updated name for existing user:', username);
      }
      
      console.log('User found:', user._id);
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      message: "Login successful", 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo
      },
      token
    });
  } catch (err) {
    console.error('Google auth error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
