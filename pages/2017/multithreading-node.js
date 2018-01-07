// Syntax
import js from 'highlight.js/lib/languages/javascript'

// Layouts
import Post from '../../layouts/essay'

// Components
import P from '../../components/paragraph'
import Link from '../../components/link'
import Meta from '../../components/meta'
import { Code, InlineCode } from '../../components/code'
import { H2, H3 } from '../../components/heading'
import { Ref, FootNotes, Note } from '../../components/footnotes'
import Quote from '../../components/quote'
import { Image } from '../../components/figure'
import HR from '../../components/hr'

export default () => (
  <Post>
    <Meta id="multithreading-node" hasCover />

    <P>
      When I wrote one of my first projects for{' '}
      <Link href="https://zeit.co">ZEIT</Link> somewhere in the middle of 2016,
      I was doing a lot of sychronous operations, although I already had put a
      transpilation setup for <InlineCode>async</InlineCode> and{' '}
      <InlineCode>await</InlineCode> in place. The reason being that I just didn{`'`}t
      see a difference between these two.
    </P>

    <P>
      Then, a few days later, when it was time to publish the package,{' '}
      <Link href="https://twitter.com/rauchg">rauchg</Link> wrote me on Slack
      saying that I should write more asynchronous code because I would
      otherwise be making {'"'}
      the concurrency of the process plummet
      {'"'}
      .
    </P>

    <P>
      Back then, I simply did what he told me and immediately noticed a slight
      performance boost. From there on, I never used any native synchronous
      functions (or packages) again and went completely asynchronous.
    </P>

    <P>
      However, I didn{"'"}t manage to ask him why it{"'"}s like that. We were
      shipping a lot of stuff at that time and I simply forgot about it.
    </P>

    <P>
      Now, nearly a year later, I came across this topic again because native
      support for both keywords{' '}
      <Link href="https://twitter.com/notquiteleo/status/834330621107433472">
        has landed
      </Link>{' '}
      and I spent a lot of time thinking about how we could take advantage of
      that at <Link href="https://zeit.co">ZEIT</Link>
      . So I collected my thoughts and we had a detailed discussion about why
      everyone should <InlineCode>await</InlineCode> asynchronous functions,
      rather than using sychronous ones (like{' '}
      <InlineCode>fs.statSync</InlineCode>).
    </P>

    <P>
      The reason why I
      {"'"}
      m writing this post is because this newly aquired skill seems very
      valuable to me, since it brings me closer to understanding the backbone of
      Node.js and allows me to improve the performance of my code drastically.
    </P>

    <P>
      Therefore, I thought making my learning progress public could make others
      - who
      {"'"}
      re in the same position - profit from this knowledge as well. At the same
      time, it helps me to strengthen my understanding of it.
    </P>

    <H2>Node.js Code Is Run Concurrently, Not in Parallel</H2>

    <P>
      When I first heard about this statement, I got a little confused. Because,
      initially, I thought both words would mean the same.
    </P>

    <P>
      In the context of computing processes, however, I learned that this
      assumption is not always true:
    </P>

    <P>
      While <b>parallel</b> operations are both started at the same time and
      literally run simultaneously (which is only possible with multi-core
      CPUs), <b>concurrent</b> ones might both make process regardless of the
      other, but cannot run at the same time (suitable for single-core CPUs).<Ref id="1" />
    </P>

    <P>Let me clarify that with an example:</P>

    <Code language="javascript" syntax={js}>
      {`setInterval(() => {
  console.log('Interval dispatched')
}, 1000)

loadDataSync()
console.log('Data downloaded')`}
    </Code>

    <P>
      As you can see, I{`'`}m handling two tasks: The first three lines
      introduce an interval that gets executed every 1000 milliseconds (one
      second) and the last line calls an arbitrary function which is doing
      something in a synchronous way.
    </P>

    <P>Now the interesting part:</P>

    <P>
      Although the code for starting the interval gets executed <b>before</b>{' '}
      the synchronous function gets called, the callback inside{' '}
      <InlineCode>setInterval()</InlineCode> won
      {"'"}
      t be run before <InlineCode>loadDataSync()</InlineCode> has returned
      something.
    </P>

    <P>
      This is because of Node/JavaScript
      {`'`}s concurrent nature. Its backbone consists of a single-threaded event
      loop and therefore doesn
      {`'`}
      t allow for operations running in parallel out of the box.
    </P>

    <P>
      Or as Panu from <Link href="https://bytearcher.com">Byte Archer</Link>{' '}
      puts it:
    </P>

    <Quote>
      The event-loop repeatedly takes an event and fires any event handlers
      listening to that event one at a time. No JavaScript code is ever executed
      in parallel.
      <br />
      <br />
      As long as the event handlers are small and frequently wait for yet more
      events themselves, all computations (for example fulfilling and serving a
      HTTP request) can be thought as advancing one small step at a time -
      concurrently. This is beneficial in web applications where the majority of
      the time is spent waiting for I/O to complete. It allows single Node.js
      process to handle huge amounts of requests.
    </Quote>

    <P>
      So technically, nothing can guarantee you that intervals in Node.js will
      always get executed on the exact times you
      {`'`}
      ve defined. Instead, the execution of the callback will be enqueued on a
      certain point in time, but will only start once the thread isn
      {`'`}
      t handling any other operation.
    </P>

    <P>
      As an example, the <InlineCode>loadDataSync()</InlineCode> function call
      shown in the snippet above might take - let
      {`'`}
      s say - <b>five seconds</b> to download some data. This would mean that
      the callback of <InlineCode>setInterval()</InlineCode> will get enqueued
      after <b>1000 milliseconds</b>
      , but not actually executed until <b>five seconds</b> have passed.
    </P>

    <P>
      Because 1000 milliseconds fit into five seconds - guess what - five times
      <Ref id="2" />
      , in our example, the callback execution would therefore get enqueued that
      often. In turn, you{`'`}ll get the message logged to the console five
      times, immediately after {`"`}the data was downloaded{`"`}:
    </P>

    <Image
      src="/static/essays/2017/multithreading-node/blocking.gif"
      width="380"
      isWindow
    />

    <H2>
      Quick! <InlineCode>await</InlineCode> To the Rescue!
    </H2>

    <P>
      To solve this problem, we need to make the operation for pulling the data
      non-blocking. At the moment, it
      {`'`}
      s still synchronous and therefore making the process
      {`'`} performance plummet.
    </P>

    <P>
      Here{`'`}s how it looks with <InlineCode>await</InlineCode>:
    </P>

    <Code language="javascript" syntax={js}>
      {`setInterval(() => {
  console.log('Interval dispatched')
}, 1000)

await loadData()
console.log('Data downloaded')`}
    </Code>

    <P>
      To make this work, you would also have to rewrite your sychronous function
      into an asynchronous one (either a <InlineCode>Promise</InlineCode> or a
      function prefixed with <InlineCode>async</InlineCode>).
    </P>

    <P>
      To make my point clear, I came up with an arrow function that simulates
      the case of <InlineCode>loadData()</InlineCode> taking 5000 milliseconds
      to finish:
    </P>

    <Code language="javascript" syntax={js}>
      {`const loadData = () => new Promise(resolve => {
  setTimeout(resolve, 5000)
})`}
    </Code>

    <P>
      Now the data is being downloaded <b>concurrently</b> with the interval
      {`'`}
      s callback getting executed every 1000 milliseconds. The operation can be
      called {`"`}
      non-blocking
      {`"`} now. In turn, our script just got much faster:
    </P>

    <Image
      src="/static/essays/2017/multithreading-node/non-blocking.gif"
      width="380"
      isWindow
    />

    <P>
      As you can see, even though the function is now acting asynchronously, the
      interval output never shows up after exact 1000 milliseconds. It
      {`'`}
      s always a slightly different number.
    </P>

    <P>
      That
      {`'`}
      s because the callback WILL get triggered after that time, but Node.js
      takes some time to actually execute the code inside it. This, however, is
      as close as we can get to raw performance using{' '}
      <InlineCode>async</InlineCode> and <InlineCode>await</InlineCode>
      .
    </P>

    <H2>Making Our Way into the Light</H2>

    <P>
      However, speeding up our code to the maximum isn
      {`'`}
      t quite so easy. There{`'`}s still a lot room left for improvement!
    </P>

    <P>
      Although we{`'`}ve fixed the problem of blocking the code by using
      asynchronous operations (a.k.a. {`"`}
      unblocking it
      {`"`}
      ), part of it is still run concurrently.
    </P>

    <P>To understand this, we need to dive a little deeper:</P>

    <P>
      In our example, we
      {`'`}
      re handling two operations: Dispatching an interval every 1000
      milliseconds and downloading data.
    </P>

    <P>Now the tricky part:</P>

    <P>
      The code I{`'`}ve shown you above introduces a function call of{' '}
      <InlineCode>loadData()</InlineCode> preceded by the{' '}
      <InlineCode>await</InlineCode> keyword. As indicated by the name, it could
      be used for loading some data from a certain origin (like the web).
    </P>

    <P>
      This means that we
      {`'`}
      re dealing with a special kind of operation. Why? Because it won
      {`'`}
      t happen entirely inside that single thread we
      {`'`}
      ve talked about.
    </P>

    <P>
      Instead, actions like fetching raw data and such are processed directly by
      the{' '}
      <Link href="https://en.wikipedia.org/wiki/Kernel_(operating_system)">
        kernel
      </Link>{' '}
      (which can be thought of as a separate {`"`}
      thread
      {`"`} or {`"`}
      process
      {`"`} - independent from the thread the interval is running in).
    </P>

    <P>
      Only the remaining {`"`}
      sub operations
      {`"`} required for loading the data (like processing the JavaScriptON
      response, which is mostly blocking) will be left to Node.js and are
      therefore run in that single-threaded event loop.
    </P>

    <P>
      In turn, part of our code is still running concurrently. Both the
      processing of the response received from the kernel and the interval are
      sharing the same thread and are therefore not able to run{' '}
      <b>truly in parallel</b>
      . Instead, they{`'`}re basically only <b>swapping turns</b> (that
      {`'`}
      s the essence of the term {`"`}
      concurrency
      {`"`}
      ).
    </P>

    <H2>The Holy Performance Grail</H2>

    <P>
      A process can contain multiple threads. Each of these threads can only
      handle one operation at the time. As a consequence, running the two
      operations in parallel would require creating two threads: One for the
      inverval and one for downloading the data. Right?
    </P>

    <P>Yep, that{`'`}s correct.</P>

    <P>
      But sadly, a Node.js process only comes{' '}
      <b>with a single thread out of the box</b> (like mentioned{' '}
      <Link href="#node-JavaScript-code-is-run-concurrently-not-in-parallel">
        before
      </Link>
      ). This means that we can
      {`'`}
      t increase the number of threads and will therefore only ever be able to
      handle <b>a single operation</b> at the same time.
    </P>

    <P>
      As a result, we need to extend its default behavior if we want to run
      things truly in parallel. And that{`'`}s where the native{' '}
      <Link href="https://nodejs.org/api/cluster.html">cluster</Link> module
      comes in:
    </P>

    <P>
      Since we can only have one operation per thread (and therefore per process
      in the case of Node.js), we need to create multiple processes to achieve
      our goal of parallelism. But that
      {`'`}
      s not very hard.
    </P>

    <P>Here{`'`}s an example how this could look:</P>

    <Code language="javascript" syntax={js}>
      {`const cluster = require('cluster')

if (cluster.isMaster) {
  setInterval(() => {
    console.log('Interval dispatched')
  }, 1000)

  cluster.fork()
} else {
  await loadData()
  console.log('Data downloaded')
}`}
    </Code>

    <P>
      Now we{`'`}re taking advantage of{' '}
      <Link href="https://nodejs.org/api/cluster.html">cluster</Link>
      {`'`}s built-in <InlineCode>.fork</InlineCode> method to make a copy of
      the current process. In addition, we
      {`'`}
      re checking if we
      {`'`}
      re still on the main one or on a clone. If we are, we create the interval
      and if we{`'`}re not, we load the data.
    </P>

    <P>
      The result of these few lines of code are operations that are actually
      running in parallel. They{`'`}re not started at the exact same time, bot
      are both running in separate processes. In turn, they can both make
      process at the same time.
    </P>

    <H3>A Butter Biscuit</H3>

    <P>
      If adding that module to your project wasn
      {`'`}
      t easy enough, we actually made multithreading even more straightforward
      by equipping <Link href="https://zeit.co/now">now</Link> with a really
      neat scaling algorithm, which seamlessly spawns multipe copies of your
      project without you even having to touch any code.
    </P>

    <P>
      Hence, you don{`'`}t even need{' '}
      <Link href="https://nodejs.org/api/cluster.html">cluster</Link> if your
      project is running on our platform. Just ensure that you{`'`}re applying{' '}
      <Link href="#quick-await-to-the-rescue">this technique</Link> wherever it{`'`}s
      possible.
    </P>

    <H3>That{`'`}s It!</H3>

    <P>
      By now, you should understand why <InlineCode>await</InlineCode> is a much
      better idea than synchronous operations what to do if that{`'`}s not
      enough.
    </P>

    <P>
      I hope this post helped you to sharpen your mindset for being able to
      choose the best direction when it comes to achieving the maximum of
      performance for your future projects.
    </P>

    <HR />

    <P>
      Big 🤗 to <Link href="https://twitter.com/OVanhoja">Olli</Link> and{' '}
      <Link href="https://twitter.com/rauchg">Guillermo</Link> for taking the
      time to clear up the confusion I had in my mind about this topic (+
      proofreading this essay) and{' '}
      <Link href="https://twitter.com/nVoidRayy">Matthias</Link> for the cute
      cover image!
    </P>

    <P>I{`'`}m truly happy to have such amazing mentors!</P>

    <FootNotes>
      <Note id="1">
        If you want to deeply understand the difference between concurrency and
        parallelism and why Node.js only comes with the former way of processing
        code, I highly recommend reading{' '}
        <Link href="https://bytearcher.com/articles/parallel-vs-concurrent/">
          this
        </Link>
        .
      </Note>
      <Note id="2">WOW, we{`'`}re doing some really heavy stuff here...</Note>
    </FootNotes>
  </Post>
)
