const zxcvbn = require('zxcvbn');

let mockUsers = [{"username" : "Omar Yehia", email: "a@b"}];

module.exports.store_user = (req, res) => {
    const { signUpData } = req.body;
    mockUsers.push(req.body);
    res.json({ success: true, message: "User added successfully!", users: mockUsers });
};

module.exports.username_taken = (req, res) => {
    const { username } = req.body;
    res.json({ usernameTaken: isParameterTaken('username', username) });
};

module.exports.email_taken = (req, res) => {
    const { email } = req.body;
    res.json({ emailTaken: isParameterTaken('email', email) });
};

module.exports.password_strength = (req, res) => {
    const { password } = req.body;

    if (!password) return res.status(400).json({ success: false, message: "Missing password"});
    
    const result = zxcvbn(password);
    res.json({
        score: result.score,
        warning: result.feedback.warning,
        suggestions: result.feedback.suggestions,
    });
};


// Helpers
const isParameterTaken = (parameter, value) => {
    return mockUsers.some((user) => user[parameter] === value);
};