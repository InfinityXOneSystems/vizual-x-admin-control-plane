# Contributing to Vizual-X Admin Control Plane

Welcome! This guide will help you contribute to this project with a clean, organized workflow that's perfect for beginners. 

## 🎯 The Philosophy: Keep It Clean

We use a **squash-based workflow** which means:
- ✅ Make as many messy commits as you want while working
- ✅ All your work gets combined into ONE clean commit when merged
- ✅ Main branch stays clean and easy to read
- ✅ No one sees your "work in progress" commits

**Bottom line:** Code freely, commit often, and don't worry about the mess—we'll clean it up automatically!

---

## 🚀 Quick Start: Your First Contribution

### Step 1: Set Up Your Workspace

```bash
# Clone the repository (first time only)
git clone https://github.com/InfinityXOneSystems/vizual-x-admin-control-plane.git
cd vizual-x-admin-control-plane

# Install dependencies
npm install
```

### Step 2: Create a Feature Branch

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create your feature branch (use a descriptive name)
git checkout -b feature/my-awesome-feature
```

**Branch Naming Guide:**
- `feature/` - New features (e.g., `feature/add-login-page`)
- `fix/` - Bug fixes (e.g., `fix/button-alignment`)
- `docs/` - Documentation (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/simplify-api`)

### Step 3: Make Your Changes

Work freely! Make as many commits as you want:

```bash
# Make changes to your files
# ... edit, edit, edit ...

# Stage and commit often (don't worry about perfect messages)
git add .
git commit -m "wip: trying something"

# Keep working
# ... more edits ...
git add .
git commit -m "fixed the thing"

# More work
# ... even more edits ...
git add .
git commit -m "ok this should work now"
```

**Pro Tips:**
- Commit early and often—it's just for you!
- Use "wip" (work in progress) in commit messages if you want
- Don't stress about perfect commit messages
- These messy commits will be squashed into one clean commit later

### Step 4: Test Your Changes

```bash
# Run type checking
npm run typecheck

# Build the project
npm run build

# If there are tests, run them
npm test
```

### Step 5: Push Your Branch

```bash
# Push your branch to GitHub
git push origin feature/my-awesome-feature
```

**First time pushing?** Git will give you a command to run, just copy and paste it!

### Step 6: Create a Pull Request

1. Go to GitHub: https://github.com/InfinityXOneSystems/vizual-x-admin-control-plane
2. You'll see a yellow banner with "Compare & pull request" button—click it!
3. Write a clear title and description:
   - **Title:** What you did (e.g., "Add user authentication")
   - **Description:** Why you did it and what it does

4. **Important:** On the PR page, look for "Merge type" or similar option
   - Select **"Squash and merge"** (this is usually the default)
   
5. Click "Create pull request"

### Step 7: Wait for Review

- Someone will review your code
- They might ask for changes—that's normal!
- Make the changes on the same branch and push again:

```bash
# Make requested changes
# ... edit files ...
git add .
git commit -m "addressed review feedback"
git push origin feature/my-awesome-feature
```

The PR will automatically update with your new commits!

### Step 8: Merge!

Once approved, a maintainer will click "Squash and merge":
- ✨ All your commits become ONE clean commit
- 🎉 Your code is now in the main branch
- 🧹 All the messy history stays private

---

## 📋 The Complete Workflow Diagram

```
YOU:
┌─────────────────────────────────────────────────────────────┐
│  main branch                                                 │
│  ─────●───────────────────────────────────────────────────  │
│        │                                                      │
│        └──● "wip"                                            │
│           │                                                   │
│           ●  "fixed it"                                      │
│           │                                                   │
│           ●  "ok now it works"                               │
│           │                                                   │
│        feature/my-awesome-feature                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    SQUASH AND MERGE
                            ↓
MAIN BRANCH:
┌─────────────────────────────────────────────────────────────┐
│  ─────●───────●─────────────────────────────────────────→  │
│            (one clean commit: "Add my awesome feature")     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Common Scenarios

### Scenario 1: Main Branch Updated While You're Working

Your branch is behind? No problem!

```bash
# Save your work
git add .
git commit -m "wip: saving progress"

# Get latest from main
git checkout main
git pull origin main

# Go back to your branch and update it
git checkout feature/my-awesome-feature
git merge main

# Or use rebase for a cleaner local history (optional)
git rebase main
```

**Don't stress!** Since we're squashing anyway, it doesn't matter if you merge or rebase here. Pick whichever you're comfortable with.

### Scenario 2: Made a Mistake in Last Commit

```bash
# Undo the last commit but keep the changes
git reset --soft HEAD~1

# Make corrections
# ... edit files ...

# Commit again
git add .
git commit -m "fixed it properly this time"
```

### Scenario 3: Want to Start Over on This Branch

```bash
# Save the branch name
# Get latest main
git checkout main
git pull origin main

# Delete and recreate your branch
git branch -D feature/my-awesome-feature
git checkout -b feature/my-awesome-feature

# Start fresh!
```

### Scenario 4: Accidentally Committed to Main

```bash
# Don't panic! Create a branch from current state
git checkout -b feature/my-awesome-feature

# Reset main back
git checkout main
git reset --hard origin/main

# Continue working on your feature branch
git checkout feature/my-awesome-feature
```

---

## 📝 Quick Reference Commands

### Daily Workflow
```bash
# Start a new feature
git checkout main
git pull origin main
git checkout -b feature/name

# Work and commit often
git add .
git commit -m "message"

# Push your work
git push origin feature/name

# Update from main
git checkout main
git pull origin main
git checkout feature/name
git merge main
```

### Fixing Mistakes
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Discard all local changes
git checkout .

# See what changed
git status
git diff
```

### Branch Management
```bash
# List all branches
git branch -a

# Switch branches
git checkout branch-name

# Delete local branch
git branch -d feature/name

# Delete remote branch
git push origin --delete feature/name
```

---

## ✅ Pre-Commit Checklist

Before pushing or creating a PR:

- [ ] Code runs without errors
- [ ] Ran `npm run typecheck` successfully
- [ ] Ran `npm run build` successfully
- [ ] Tested the feature manually
- [ ] Removed any console.logs or debug code
- [ ] Updated documentation if needed

---

## 💡 Tips for Success

1. **Commit Often**: Even if it's messy—squash will clean it up!

2. **Pull Before Starting**: Always get the latest main before creating a branch

3. **Small PRs**: Smaller changes = faster reviews = quicker merges

4. **Descriptive PR Titles**: "Fix bug" ❌ vs "Fix login button alignment" ✅

5. **Test Locally**: Catch issues before the review

6. **Ask Questions**: Confused? Ask in the PR comments!

7. **Stay Updated**: Pull from main regularly to avoid conflicts

---

## 🎓 Understanding Squash Merge

### What Happens When You Squash?

**Your Messy Branch:**
```
● wip: started the feature
● fixed typo
● removed console.log  
● addressed linting issues
● final fix before review
```

**After Squash Merge:**
```
● Add user authentication feature
  
  Complete implementation of login/logout functionality
  including form validation and error handling.
```

### Why Squash?

✅ **Clean History**: Main branch reads like a book  
✅ **Easy Rollback**: One commit = one feature to revert if needed  
✅ **Focus on Outcomes**: What was done, not how it was done  
✅ **Beginner Friendly**: No need to learn complex git rebase/squash commands  

### When NOT to Squash?

- Very large features that logically should be multiple commits
- You made genuinely meaningful, separate changes that should be preserved
- The team specifically asks for separate commits

In these cases, ask a maintainer for guidance!

---

## 🆘 Getting Help

### Something Went Wrong?

1. **Don't Force Push**: Unless you're 100% sure what you're doing
2. **Don't Panic**: Git rarely loses your work permanently
3. **Ask for Help**: Share your problem in the PR or create an issue

### Common Error Messages

**"Your branch is behind origin/main"**
```bash
git pull origin main
```

**"Merge conflict"**
```bash
# Open the conflicted files, look for <<<<<<< markers
# Edit to keep what you want
git add .
git commit -m "resolved conflicts"
```

**"Permission denied"**
- Check that you have push access to the repository
- Make sure you're logged into GitHub

---

## 📚 Learn More

- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

---

## 🙋 Questions?

If you have questions about this workflow, feel free to:
- Open an issue with the `question` label
- Ask in your pull request
- Reach out to the maintainers

**Remember**: Every expert was once a beginner. We're here to help! 🚀

---

*Last Updated: February 2026*
