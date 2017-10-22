import markdown from 'markdown-in-js'
import asPost from '../../layouts/post'
import { Code, InlineCode } from '../../components/code'
import components from '../../components'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'

export default asPost({
  id: 'canary'
})(markdown(components)`

  At the moment of writing, our ecosystem spans
  several major applications that are crucial for the
  day-to-day operations of the company.

  The list not only
  includes [Now CLI](https://zeit.co/download#command-line) and [Now Desktop](https://zeit.co/download) (which,
  along with [our site](https://zeit.co), prepresent the most
  important entry points to
  our platform), but also software
  like [Hyper](https://hyper.is) and [Next.js](https://github.com/zeit/next.js) - which
  eliminate all of the primary
  pain points you come across when building something online.

  Summa summarum: They're all equally important to us and we
  love working on them and pushing all of them into the direction
  of a even brighter future with the help of our
  wonderful community. 🤗

  That's also the reason why we're very excited whenever the
  time for a new feature or release comes: It's just a
  really great feeling to ship! 🤤

  However, as the number of people that are using these
  apps keeps growing exponentially, a decision had to be made
  in order to preserve the stability of the code we actually hand
  out into the world - something
  that would ensure no friction is caused when publishing
  updates.

  As a result, we've decided to
  start publishing [Canary Releases](https://zeit.co/blog/canary).

  In the following sentences, I'll talk about how we actually implemented
  this into three of our
  apps: [Now CLI](https://zeit.co/download#command-line), [Now Desktop](https://zeit.co/download) and [Hyper](https://hyper.is). If
  you haven't read the [article](https://zeit.co/blog/canary) about how to enable it yet, I highly recommend to do so first.

  ## Now CLI

  Just like the stable ones, the canary releases for Now CLI
  are available through three channels: You can either install
  them through [npm](https://www.npmjs.com/package/now), [Now Desktop](https://zeit.co/download), or
  by downloading [the binaries](https://github.com/zeit/now-cli/releases) directly (see how to
  do that [here](https://zeit.co/blog/canary)).

  In all three cases, the source [GitHub Releases](https://github.com/zeit/now-cli/releases). In between,
  our own CDN ensures that the files get compressed (GZIP) and are available at maximum download speed for
  any location in the world. While being streamed to the client, they're being
  decompressed and placed in your local binary directory.

  At this point, I'd also like to clear up some confusion about
  how our [npm package](https://www.npmjs.com/package/now) is installed: While
  we do provide a different source for the content of the package (our CDN,
  as mentioned above), we do not interfere with the decisions
  npm is making about where to place the binary.

  This means that, if
  you'd like the binaries to be installed in a different location, just
  configure npm accordingly.

  ### What Changed

  In order to support canary releases, we firstly had to adjust
  the [microservice](https://now-cli-releases.zeit.sh) that
  contains the CDN's download links to the binary files
  for all supported platforms of the latest release.

  Instead of
  responding with the latest stable one by default, it now responds
  with an object containing one property for each channel:

  ${(
    <Code language="javascript" syntax={json}>{`{
  "stable": {...},
  "canary": {...}
}`}</Code>
  )}

  This brings us right to the next part of what changed: If you've
  enabled canary updates in Now Desktop, it will
  start using the ${<InlineCode>canary</InlineCode>} property (instead
  of the ${<InlineCode>stable</InlineCode>} one) to check
  for Now CLI updates.

  When installing it using npm, the flow is a little
  different: The requests to [GitHub Releases](https://github.com/zeit/now-cli/releases) will
  go through the CDN, but won't touch the API mentioned above. That's
  because the microservice is only meant to cache the latest stable and
  canary release to prevent Now Desktop or our site (which are both
  requesting the latest release) to hit GitHub's rate limit.

  However, we still had to make adjustments to the way how
  new npm package updates are published: Because there are now two
  branches on
  the [GitHub repository](https://github.com/zeit/now-cli) ("canary" and "master")
  we had to configure [Travis CI](https://travis-ci.org) to set different
  tag on each npm release depending on the branch the release commit happened in.

  The tricky part about this was to hand the CI a correct condition specification, under
  which a release should happen:

  Although you can tell Travis CI to deploy a release if the commit was tagged, it
  gets a little harder if you want to check for the branch on top of that:

  While you can set both [conditions](https://docs.travis-ci.com/user/deployment#Conditional-Releases-with-on%3A) (which
  is needed in our case, because we only want a release
  to happen if the commit was tagged on a certain branch), the ${(
    <InlineCode>branch</InlineCode>
  )} one will be ignored
  if ${<InlineCode>tags</InlineCode>} is also set:

  ${(
    <Code language="javascript" syntax={json}>{`"on": {
  "branch": "canary",
  "tags": true
}`}</Code>
  )}

  This is because - in the case of a tagged commit - Travis CI doesn't receive
  any information about the branch at all.

  To work around this technical limitation, we had to customize
  the ${<InlineCode>install</InlineCode>} step in the CI and make sure
  to clone the whole repository (instead of just checking out
  the commit, which is what Travis CI is doing by default):

  ${(
    <Code language="javascript" syntax={json}>{`"install": [
  "git clone https://github.com/$TRAVIS_REPO_SLUG.git $TRAVIS_REPO_SLUG",
  "cd $TRAVIS_REPO_SLUG",
  "yarn"
]`}</Code>
  )}

  In addition to this, the [config file](https://github.com/zeit/now-cli/blob/canary/.travis.yml) also
  received custom condition properties for ensuring that
  the deployment to the ${<InlineCode>latest</InlineCode>} tag on npm
  only happened for the "master" branch and ${(
    <InlineCode>canary</InlineCode>
  )} only
  received releases on the "canary" one.

  Because we had fixed the ${<InlineCode>install</InlineCode>} step, we were
  now able to use the freshly obtained branch information to create a
  custom condition (Travis CI is passing these right into a
  bash ${<InlineCode>if</InlineCode>} statement):

  ${(
    <Code language="javascript" syntax={json}>{`"on": {
  "condition": "\\"$(git rev-parse --abbrev-ref HEAD)\\" == \\"canary\\"",
  "tags": true
}`}</Code>
  )}

  Now that all of this configuration is in place, we only need to
  push a tagged commit and create
  a [GitHub Release](https://github.com/zeit/now-cli/releases) using [release](https://github.com/zeit/release) that's
  marked as a "pre-release". After
  that, the CI will handle the rest, upload the binaries and publish a
  new version of the npm package by itself.

  From there on, users will be able to install the canary release from
  npm using the "canary" tag and all Now Desktop instances
  with the enabled "Canary Updates" preference will receive the CLI
  update automatically.

  ## Now Desktop & Hyper

  Because we're using [Hazel](https://github.com/zeit/hazel) to deliver updates to both
  apps, implementing the canary channel was a matter of two major changes:

  Firstly, we had to deploy new two new update servers (since each [Hazel](https://github.com/zeit/hazel) instance is designed to handle only a single update channel). For both apps, this was as easy as running two commands:

  {<Code language="bash" syntax={bash}>now -e NODE_ENV=\"production" -e PRE="1" zeit/hazel</Code>}

  The most important part about the above command is the ${(
    <InlineCode>PRE</InlineCode>
  )} environment
  flag. It tells the update server to only pick up pre-releases.

  These are the new Hazel instances providing Now Desktop and Hyper
  with canary updates (if [enabled](https://zeit.co/blog/canary) in the config):

  - [now-desktop-releases-canary.zeit.sh](https://now-desktop-releases-canary.zeit.sh)
  - [releases-canary.hyper.is](http://releases-canary.hyper.is)

  They align very nicely with the existing stable channel instances:

  - [now-desktop-releases.zeit.sh](https://now-desktop-releases.zeit.sh)
  - [releases.hyper.is](http://releases.hyper.is)

  After we've ensured that the update servers are in place, the only
  thing left was making Now Desktop ([PR](https://github.com/zeit/now-desktop/pull/383)) and
  Hyper ([original PR](https://github.com/zeit/hyper/pull/2101), [final PR](https://github.com/zeit/hyper/pull/2127)) capable
  of providing the user with canary updates.

  Thanks to [Hazel](https://github.com/zeit/hazel)'s straightforward approach
  to updating Electron apps, this was all we had to do. Now both apps
  have a canary channel!


`)
