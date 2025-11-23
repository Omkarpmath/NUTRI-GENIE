# Contributing to NutriGenie

First off, thank you for considering contributing to NutriGenie! 🎉 It's people like you that make NutriGenie such a great tool for the health and wellness community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Styleguides](#styleguides)
  - [Git Commit Messages](#git-commit-messages)
  - [JavaScript Styleguide](#javascript-styleguide)
  - [EJS Templates](#ejs-templates)
- [Development Setup](#development-setup)
- [Testing](#testing)

---

## Code of Conduct

This project and everyone participating in it is governed by our commitment to fostering an open and welcoming environment. By participating, you are expected to uphold this code.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find that the issue has already been reported. When creating a bug report, include as many details as possible.

#### How to Submit a Bug Report

1. **Use a clear and descriptive title** for the issue
2. **Describe the exact steps to reproduce the problem**
3. **Provide specific examples** to demonstrate the steps
4. **Describe the behavior you observed** and what behavior you expected to see
5. **Include screenshots** if relevant
6. **Include your environment details:**
   - OS: [e.g., macOS 13, Windows 11, Ubuntu 22.04]
   - Node.js version: [e.g., 18.17.0]
   - Browser: [e.g., Chrome 118, Safari 17]

**Example:**
```markdown
**Bug:** Meal plan generation fails with dairy allergy restriction

**Steps to reproduce:**
1. Login to the application
2. Navigate to health data input form
3. Enter "dairy" in allergies field
4. Submit form
5. Observe error in console

**Expected behavior:** 
Meal plan should be generated without dairy products

**Actual behavior:**
Error 500 - "Failed to generate meal plan"

**Environment:**
- OS: macOS 13.5
- Node.js: 18.17.0
- Browser: Chrome 118
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

1. **Use a clear and descriptive title**
2. **Provide a detailed description** of the suggested enhancement
3. **Explain why this enhancement would be useful**
4. **List some examples** of how it would be used
5. **Include mockups** if you're suggesting UI changes

### Your First Code Contribution

Unsure where to begin? You can start by looking through `beginner` and `help-wanted` issues:

- **Beginner issues** - issues that should only require a few lines of code
- **Help wanted issues** - issues that may be more involved

### Pull Requests

The process described here aims to:
- Maintain NutriGenie's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible NutriGenie

#### Pull Request Process

1. **Fork the repository** and create your branch from `main`

```bash
git checkout -b feature/YourAmazingFeature
```

2. **Make your changes**
   - Follow the coding standards
   - Add tests if applicable
   - Update documentation if needed

3. **Test your changes**
```bash
npm run dev
# Test thoroughly in your browser
```

4. **Commit your changes**
```bash
git commit -m 'Add some AmazingFeature'
```

5. **Push to your fork**
```bash
git push origin feature/YourAmazingFeature
```

6. **Open a Pull Request**
   - Fill in the required template
   - Link any related issues
   - Include screenshots for UI changes
   - Wait for review

#### Pull Request Requirements

- ✅ Code follows the project's style guidelines
- ✅ Self-review of your code completed
- ✅ Comments added to complex code sections
- ✅ Documentation updated if needed
- ✅ No new warnings generated
- ✅ Changes tested locally
- ✅ PR description clearly describes the changes

---

## Styleguides

### Git Commit Messages

Follow these conventions for commit messages:

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**
```
feat(meal-plan): add vegetarian meal plan option

Add support for generating vegetarian-only meal plans when user
specifies vegetarian dietary preference in the form.

Closes #42
```

```
fix(auth): resolve session timeout issue

Sessions were expiring too quickly due to incorrect maxAge setting.
Updated session configuration to 24 hours.

Fixes #89
```

### JavaScript Styleguide

- **Use ES6+ syntax** (const/let, arrow functions, async/await)
- **Use meaningful variable names**
- **Add comments** for complex logic
- **Keep functions small** and focused on one task
- **Use async/await** instead of promises when possible

**Good:**
```javascript
// Calculate user's Total Daily Energy Expenditure
async function calculateTDEE(bmr, activityLevel) {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
}
```

**Bad:**
```javascript
function calc(b, a) {
  var m = {s: 1.2, l: 1.375, m: 1.55, a: 1.725, v: 1.9};
  return Math.round(b * m[a]);
}
```

### EJS Templates

- **Use consistent indentation** (2 spaces)
- **Keep logic minimal** in templates
- **Use descriptive variable names**
- **Comment complex template logic**

**Good:**
```ejs
<!-- Display user's personalized meal plan -->
<div class="meal-plan">
  <h2>Your 7-Day Meal Plan</h2>
  <% Object.keys(mealPlan).forEach(day => { %>
    <div class="day-plan">
      <h3><%= day.charAt(0).toUpperCase() + day.slice(1) %></h3>
      <%- JSON.stringify(mealPlan[day], null, 2) %>
    </div>
  <% }); %>
</div>
```

---

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

### Setup Steps

1. **Clone your fork**
```bash
git clone https://github.com/YOUR-USERNAME/NutriGenie.git
cd NutriGenie
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

### Project Structure

Understanding the codebase:

```
NutriGenie/
├── server.js           # Main application entry point
├── views/              # EJS templates
│   ├── home.ejs       # Landing page
│   ├── login.ejs      # Authentication
│   ├── index.ejs      # Health data form
│   ├── result.ejs     # AI recommendations
│   └── dashboard.ejs  # User dashboard
└── public/            # Static assets
    ├── css/          # Stylesheets
    └── images/       # Images
```

---

## Testing

### Manual Testing Checklist

Before submitting a PR, test the following user flows:

- [ ] User registration/signup
- [ ] User login
- [ ] Health data form submission
- [ ] Meal plan generation
- [ ] Workout plan generation
- [ ] Dashboard access
- [ ] Logout functionality

### Test with Different Inputs

- [ ] Different age ranges (18-80)
- [ ] Different weights (40kg-150kg)
- [ ] Different heights (140cm-200cm)
- [ ] Various dietary restrictions
- [ ] Different fitness goals
- [ ] All activity levels

### Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Testing

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design at various breakpoints

---

## Questions?

Feel free to:
- Open an issue with the `question` label
- Start a discussion on GitHub Discussions
- Reach out to the maintainers

---

## Additional Resources

- [Project README](README.md)
- [Issue Tracker](https://github.com/yourusername/NutriGenie/issues)
- [Pull Requests](https://github.com/yourusername/NutriGenie/pulls)

---

**Thank you for contributing to NutriGenie!** 💜

Every contribution, no matter how small, helps make health and wellness accessible to everyone.
