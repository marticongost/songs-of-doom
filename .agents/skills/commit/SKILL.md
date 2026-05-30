---
name: commit
description: Commit changes to the Git repository atomically, passing commit hooks.
---

## 1. Analyze changes

Inspect the changes in the working directory. Divide them into logical groups of related
changes that can be committed together. For example, if you modified a property and
updated all entities using it, those changes should be in the same commit.

If there is a single change, proceed to step 2. If there are multiple unrelated changes,
present the user with a summary of the changes in each prospective commit, and ask for
confirmation before proceeding.

## 2. Commit changes

1. Run the commit hooks (e.g. linting, tests). If there are failures, analyze them and
   fix the issues (if trivial) or report them to the user if they are indicative of
   deeper problems.
2. Once all checks pass, proceed commit by commit:
   a. Stage the relevant changes for the commit
   b. Generate a descriptive commit message based on the changes
   c. Commit, skipping the commit checks (since we already ran them globally)
