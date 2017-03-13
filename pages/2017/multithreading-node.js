// Layouts
import Post from '../../layouts/essay'

// Components
import P from '../../components/paragraph'
import Link from '../../components/link'
import Meta from '../../components/meta'
import {Inline} from '../../components/code'

export default () => (
  <Post>
    <Meta id="multithreading-node"/>

    <P>When I wrote the initial version
    of <Link href="https://github.com/zeit/serve">serve</Link> (called {'"'}micro-list{'"'} back then) somewhere
    in the middle of 2016, I was doing a lot of sychronous operations although we already had a
    transpilation setup for <Inline>async</Inline> and <Inline>await</Inline> in place.</P>

    <P>Then, a few days later when it was time to publish the package, <Link href="https://twitter.com/rauchg">rauchg</Link> wrote
    me on Slack saying that I should write more asynchronous code because I would otherwise be making {'"'}the concurrency of the process plummet{'"'}.</P>

    <P>Back then, I simply did what he told me and immediately noticed a slight
    performance boost. From there on, I never used any native synchronous functions (or packages) again
    and went completely asynchronous.</P>

    <P>However, I didn{'\''}t manage to ask him why it{'\''}s like that. We
    were shipping a lot of stuff at that time and I simply forgot about it.</P>

    <P>Now, nearly a year later, I came across this topic again because native support
    for both keywords <Link href="https://twitter.com/notquiteleo/status/834330621107433472">has landed</Link> and
    I spent a lot of time thinking about how we could take advantage of that at <Link href="https://zeit.co">ZEIT</Link>. So I collected all of my thoughts
    and we had a detailed discussion about why everyone should <Inline>await</Inline> asynchronous functions, rather than
    using sychronous ones (like <Inline>fs.statSync</Inline>).</P>

    <P>The reason why I{'\''}m writing this post is because this newly aquired skill
    seems very valuable to me, since it brings me closer to understanding the backbone of Node.js and
    allows me to improve the performance of my code drastically.</P>

    <P>In turn, I thought making my learning progress public could
    help others - who{'\''}re in the same position - to take advantage of this knowledge as well.</P>

  </Post>
)
