# ⚠️ CRITICAL: Before You Submit to GSOC

This file is YOUR responsibility checklist. **Do not skip this.**

---

## You Must Understand This Before Submitting

### The Core Issue

**Metaflow has strict AI policies.** If you submit work claiming it's your own when it's AI-assisted, you will be rejected or even banned from future GSOC.

**What makes it OK**:
- ✅ You disclose AI assistance upfront
- ✅ You can explain every line of code
- ✅ You understand the architecture
- ✅ You can defend your work in a technical interview

**What makes it NOT OK**:
- ❌ You hide AI assistance
- ❌ You can't explain how something works
- ❌ You claim it's 100% your own
- ❌ You can't answer follow-up questions

---

## Your Submission Workflow

### Step 1: UNDERSTAND (This Week)
```
□ Read GSOC_PROJECT_SUMMARY.md completely
□ Read GSOC_INTERVIEW_GUIDE.md completely
□ Work through each exercise in the guide
□ Open decorators.py and trace through validation logic
□ Open cli.py and trace through lazy loading logic
□ Look at type hints in flowspec.py and client/
□ Read metaflow/docs/extensions-guide.md
□ Answer all interview questions from guide
□ Until you can explain each change in plain English
```

### Step 2: VERIFY (This Week)
```
□ Run: cd metaflow && python3 -c "import metaflow; print('✓')"
□ Run: cd test/core && python3 run_tests.py --tests basic_check
□ Test decorator validation manually (see GSOC_INTERVIEW_GUIDE.md)
□ Test lazy loading manually (create a flow, run it)
□ Check type hints with: python3 -c "from metaflow import FlowSpec; 
   import inspect; print(inspect.signature(FlowSpec.__init__))"
□ Verify all changes with: git diff 0ba3f4d7..2e86b8f9
```

### Step 3: PRACTICE (This Week)
```
□ Practice explaining decorator validation (2 min)
□ Practice explaining lazy loading (2 min)
□ Practice explaining type hints (2 min)
□ Practice explaining architecture (5 min)
□ Practice answering "Why did you choose this?" for each change
□ Record yourself explaining and listen back
□ Do mock interview with friend
```

### Step 4: DISCLOSE (When Writing PR/Proposal)
```
□ In your GSOC proposal: "This work was developed with AI assistance from Claude"
□ In PR: Reference this disclosure
□ Link to: GSOC_INTERVIEW_GUIDE.md for proof of understanding
□ Show: Testing results showing it works
□ Provide: Plain-English explanation of each change
```

### Step 5: SUBMIT (After All Above)
```
□ Only after steps 1-4 complete
□ Only if you can answer all interview questions
□ Only if tests pass
□ Only if disclosure is prominent
□ Only if you're confident in your understanding
```

---

## Red Flags - STOP If Any Apply

🛑 **STOP if**: "I don't understand any of the code changes"  
→ **Action**: Read GSOC_INTERVIEW_GUIDE.md, study more, ask questions

🛑 **STOP if**: "I'm not sure what the decorator validation does"  
→ **Action**: Read Section 1 of guide, trace through code, test it

🛑 **STOP if**: "I don't know what lazy loading is"  
→ **Action**: Read factory pattern documentation, study Section 2, test it

🛑 **STOP if**: "I can't explain why this choice"  
→ **Action**: Re-read the problem statement in the guide

🛑 **STOP if**: "The tests aren't passing"  
→ **Action**: Debug with `git diff`, review changes, run individual tests

🛑 **STOP if**: "I'm about to submit without studying"  
→ **Action**: STOP. Study the interview guide first.

---

## What You Need to Know Cold (Memorize This)

### 1. Decorator Validation
- **What**: Validates that decorator attribute names follow Python identifier rules
- **Why**: Prevents parsing bugs from invalid names (spaces, special chars)
- **How**: Regex pattern `^[a-zA-Z_][a-zA-Z0-9_]*$` + DeprecationWarning
- **Test**: Run code with valid/invalid names, verify warnings

### 2. Lazy Package Loading
- **What**: Defer package creation until actually used
- **Why**: Package creation is expensive, not needed for `metaflow version`
- **How**: Factory pattern + property + caching
- **Test**: Run `metaflow version`, verify it works, verify package lazy loads

### 3. Type Hints
- **What**: Add type annotations to public APIs
- **Why**: Enable IDE support, static analysis, documentation
- **How**: Add `: Type` to parameters and `-> ReturnType` to functions
- **Test**: Check with `inspect.signature()`, verify IDE shows hints

### 4. Extension Guide
- **What**: Comprehensive documentation for writing extensions
- **Why**: Reduce contributor onboarding, democratize extension development
- **How**: Synthesize existing patterns into organized guide
- **Test**: Read guide, verify examples match patterns in metaflow/plugins/

### 5. Architecture Layers
- **What**: Project organized into 8 distinct layers
- **Why**: Separation of concerns, easier testing, modularity
- **How**: Analyzed codebase, identified patterns, documented organization
- **Test**: Map files to layers, verify dependencies are correct

---

## Interview Questions You'll Get (And Answers)

### Q1: "Walk me through the decorator validation change"
**Your Answer** (should be 2-3 min):
> "The problem was that decorator specs could have spaces in attribute names, like 'my attr=value', which could cause parsing issues. I fixed it by validating against Python identifier rules - a string that starts with a letter or underscore, then has letters, numbers, or underscores. If it doesn't match, I emit a DeprecationWarning instead of an error so existing code doesn't break. Here's a test that demonstrates it... [show test]"

### Q2: "Why lazy loading instead of eager instantiation?"
**Your Answer** (should be 1-2 min):
> "Creating a package is expensive - it snapshots code, analyzes dependencies, serializes everything. But commands like `metaflow version` don't need the package at all. Using a factory pattern means we only create the package when something actually uses it. It's a standard optimization: only pay for what you use. The property acts as a trigger - when someone accesses ctx.obj.package, it creates it once and caches it."

### Q3: "Why is this backward compatible?"
**Your Answer** (should be 1 min):
> "The decorator validation warns instead of erroring, so existing code works but users get notice. The lazy loading is internal - the public API (ctx.obj.package accessing) works the same way. Type hints don't enforce anything at runtime - they're just hints for tools. The extension guide is documentation, not code changes. Nothing breaks existing code."

### Q4: "How did you verify this works?"
**Your Answer** (should be 2-3 min):
> "I ran the core test suite (basic_check) which passed. I manually tested [specific scenario]. I verified backward compatibility by [specific test]. Here's the test output... [show it]"

### Q5: "Where's the AI assistance and what bothers you about it?"
**Your Answer** (should be honest):
> "AI helped with analysis and documentation writing, not the core code changes. The code itself uses standard patterns - regex validation, factory pattern, type annotations - which I fully understand. What concerns me is misrepresenting work. That's why I'm being upfront about it and demonstrating my understanding through these explanations."

---

## Final Sign-Off

Only read this section AFTER you've done everything above:

### I Understand:
- [ ] Every code change and why it was made
- [ ] The architecture of Metaflow (8 layers)
- [ ] How to test each change
- [ ] How to explain each change in simple terms
- [ ] Why backward compatibility matters
- [ ] What the extension guide provides
- [ ] How to disclose AI assistance properly

### I Can Explain:
- [ ] Decorator attribute validation (can teach someone else)
- [ ] Lazy package loading (understand the pattern)
- [ ] Type hints (why they matter, how they work)
- [ ] Extension architecture (can walk someone through an example)

### I Have Tested:
- [ ] Core tests passing
- [ ] Decorator validation works (tested with valid/invalid names)
- [ ] Package creation isn't breaking anything
- [ ] Type hints show up in inspect.signature()
- [ ] Extension guide examples match real code patterns

### I Will Disclose:
- [ ] AI assistance in my GSOC proposal
- [ ] AI assistance in my PR
- [ ] My full understanding in interview
- [ ] Any gaps or uncertainties (better to say now than pretend)

---

## If You Get Stuck

**Don't proceed without help:**

1. **Understanding gap**: Re-read GSOC_INTERVIEW_GUIDE.md → Work through exercise
2. **Testing issue**: Run tests step by step → Debug with git output
3. **Interview question**: Practice answer → Record yourself → Listen back
4. **Uncertainty**: Ask a mentor → Don't hide it → Get help now

---

**Ready to submit?** Only when ALL boxes above are checked and you're 100% confident.

**Not ready?** Study more. That's OK and expected. Be honest about what you don't know yet.
