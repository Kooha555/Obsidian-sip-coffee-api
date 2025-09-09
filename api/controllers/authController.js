

const router = new express.Router();

router.post("/auth/register", async (req, res) => {
  try {
    const {firstname, lastname, email, phone, username, password} = req.body;

    if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
      .status(409)
      .json({ error: true, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      email,
      phone,
      username,
      password: hashedPassword
    })
    await newUser.save();
    res.status(201).json({
      error: false,
      message: "User registered successfully!"
    });
    } catch (error) {
      res.status(500).json({
        error: true,
        message: "Server error, error"
      });
    }
  });