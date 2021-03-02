# Contributors Guide

First, thanks for taking the time to contribute to our project! The following information provides a guide for making contributions.

## Code of Conduct

We encourage inclusive and professional interactions on our project. We welcome everyone to open an issue, improve the documentation, report bug or submit a pull request. By participating in this project, you agree to abide by the [Verizon Media Code of Conduct](Code-Of-Conduct.md). If you feel there is a conduct issue related to this project, please raise it per the Code of Conduct process and we will address it.

## How to Contribute

Contributions are welcome via pull requests and issues. Before submitting a pull
request, please make sure all tests pass by running `npm test`. Please
follow our style guide [JS]() and [CSS](). These style guides are enforced via
ESLint.

## Improve Documentation

We are always looking to improve our documentation. If you are reading the
documentation and something is not clear, or you can't find what you are looking
for, then please open an issue with this repository. This gives us a chance to
answer your question and to improve the documentation if needed.

Pull requests correcting spelling or grammar mistakes are always welcome.

## Issues

### Issues Labeling

Navi uses [Standard Issue Labels](https://github.com/wagenet/StandardIssueLabels)
for Github Issues.

### Reporting a Bug

1. Update to the most recent master release if possible. We may have already
   fixed your bug.

1. Search for similar issues. It's possible somebody has encountered this bug
   already.

1. Please try to answer at least the following questions when reporting a bug:

   - Which version of the project did you use when you noticed the bug?
   - How do you reproduce the error condition?
   - What happened that you think is a bug?
   - What should it do instead?
   - Please make sure you provide very specific steps to reproduce the error. If
     we cannot reproduce it, we will close the ticket.

1. Your issue will be verified. The provided example will be tested for
   correctness. The Navi team will work with you until your issue can be
   verified.

1. Keep up to date with feedback from the Navi team on your ticket. Your ticket
   may be closed if it becomes stale.

1. If possible, submit a Pull Request with a failing test. Better yet, take a
   stab at fixing the bug yourself if you can!

The more information you provide, the easier it is for us to validate that there
is a bug and the faster we'll be able to take action.

## Requesting a Feature

1. Please provide some thoughtful commentary and code samples on what this
   feature should do and why it should be added (your use case). Every feature
   request should answer at least these questions:

   - What will it allow you to do that you can't do today?
   - Why do you need this feature and how will it benefit other users?
   - Are there any drawbacks to this feature?

1. After discussing the feature you may choose to attempt a [Pull
   Request](#submitting-a-pull-request). If you're able, start writing some
   code. We always have more work to do than time to do it. If you can write
   some code then that will speed the process up.

In short, if you have an idea that would be nice to have, create an issue.

## How to work with this project locally

1. Selecting a Feature / Issue to which you wish to contribute
1. Fork the master repo.
1. Add a comment in the given issue to let our team know your intentions.
1. Use the GitHub issue to converse regarding requirements.

### Setup

Please refer to [Starter Guide]()

### Running tests

`npm test`

### How to fix a bug

If you're fixing a bug that's already been added to the issues, ask yourself
whether the bug description is clear. Do you know what circumstances that led to
the bug? Does it seem easy to reproduce?

If you've spotted a bug yourself, open an issue and try to answer those
questions.

Then start writing some code:

1. Make the tests fail. Identify what's happening in the bug with a test. This
   way the bug is reproducible for everyone else in the project, and we won't
   regress into making the bug ever again (hopefully!).

1. Make the tests pass again. Write your code that fixes the bug and makes it
   pass.

[Done with your changes?](#submitting-a-pull-request)

### How to refactor code

Refactoring code shouldn't require any new tests, but you should make sure the
tests still pass.

[Done with your refactoring?](#submitting-a-pull-request)

### How to update dependencies

To update a dependency, you will need to follow these steps:

1. The pull request will contain useful information about what's changed,
   including breaking changes. You will also want to check the dependency's
   github and/or npm listing for changelog and recommended updating steps.

1. Pull down the branch locally.

1. Update the dependency and perform any steps the project suggests for
   updating. Sometimes this requires updating other dependencies, changing
   configuration code, or other tasks.

1. Build, run, and verify that tests pass.

1. Verify that everything looks good: Check pages and components that make use
   of the library and ensure they are still working as expected.

At this point, follow the steps described in [Submitting a pull
request](#submitting-a-pull-request), but you won't need to open a pull request
since one already exists. Mark the pull request as `needs code review`.

### How to write new code

When you're ready to write some new code, you should do the following:

1. Write some documentation for your change. Why do this first? Well, if you
   know the behavior you want to see, then it's easier to validate if it works
   as expected. Think of this as documentation-driven development.

1. Add a test for your change.

1. Make the test pass by running `npm test`

Try to keep your changes to a max of around 200 lines of code whenever possible.
Why do this? Apparently the more changes incurred in a pull request, the
likelier it is that people who review your code will just gloss over the
details. Smaller pull requests get more comments and feedback than larger ones.
Crazy, right?

[Done with your changes and ready for a review?](#submitting-a-pull-request)

## Submitting a pull-request?

Sweet, we'd love to accept your contribution! Open a new pull request and fill
out the provided form.

We only seek to accept code that you are authorized to contribute to the project.
We have added a pull request template on our projects so that your contributions
are made with the following confirmation:

> I confirm that this contribution is made under the terms of the license found in the
> root directory of this repository's source tree and that I have the authority necessary
> to make this contribution on behalf of its copyright owner.

If your pull-request addresses an issue then please add the corresponding
issue's number to the description of your pull-request.

Please follow the [eslint](https://github.com/conventional-changelog-archived-repos/conventional-changelog-eslint/blob/master/convention.md) changelog convention for your commit messages.

Here are some things that will increase the chance that your pull-request will
get accepted:

- Did you locally merge (or rebase) the upstream branch into your topic branch?
- Did you confirm this fix/feature is something that is needed?
- Did you write tests, preferably in a test driven style?
- Did you add documentation for the changes you made?
- Did you follow our style guide [JS]() and [CSS]()?
- Did you ensure that no errors are generated by ESLint?
- Did you commit your changes in logical chunks?
