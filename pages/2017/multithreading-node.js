// Layouts
import Post from '../../layouts/essay'

// Components
import P from '../../components/paragraph'
import Link from '../../components/link'
import Meta from '../../components/meta'
import {Code, InlineCode} from '../../components/code'
import {H2} from '../../components/heading'
import {Ref, FootNotes, Note} from '../../components/footnotes'
import Quote from '../../components/quote'
import {Image} from '../../components/figure'

export default () => (
  <Post>
    <Meta id="multithreading-node"/>

    <P>When I wrote the initial version
    of <Link href="https://github.com/zeit/serve">serve</Link> (called {'"'}micro-list{'"'} back then) somewhere
    in the middle of 2016, I was doing a lot of sychronous operations although we already had a
    transpilation setup for <InlineCode>async</InlineCode> and <InlineCode>await</InlineCode> in place.</P>

    <P>Then, a few days later when it was time to publish the package, <Link href="https://twitter.com/rauchg">rauchg</Link> wrote
    me on Slack saying that I should write more asynchronous code because I would otherwise be making {'"'}the concurrency of the process plummet{'"'}.</P>

    <P>Back then, I simply did what he told me and immediately noticed a slight
    performance boost. From there on, I never used any native synchronous functions (or packages) again
    and went completely asynchronous.</P>

    <P>However, I didn{'\''}t manage to ask him why it{'\''}s like that. We
    were shipping a lot of stuff at that time and I simply forgot about it.</P>

    <P>Now, nearly a year later, I came across this topic again because native support
    for both keywords <Link href="https://twitter.com/notquiteleo/status/834330621107433472">has landed</Link> and
    I spent a lot of time thinking about how we could take advantage of that at <Link href="https://zeit.co">ZEIT</Link>. So I collected my thoughts
    and we had a detailed discussion about why everyone should <InlineCode>await</InlineCode> asynchronous functions, rather than
    using sychronous ones (like <InlineCode>fs.statSync</InlineCode>).</P>

    <P>The reason why I{'\''}m writing this post is because this newly aquired skill
    seems very valuable to me, since it brings me closer to understanding the backbone of Node.js and
    allows me to improve the performance of my code drastically.</P>

    <P>In turn, I thought making my learning progress public could
    help others - who{'\''}re in the same position - to take advantage of this knowledge as well.</P>

    <H2>Node.js Code Is Run Concurrently, Not in Parallel</H2>

    <P>When I first heard about this statement, I got a little confused. Intially, I thought both words
    would mean the same.</P>

    <P>In the context of computing processes, however, I
    learned that this assumption is not always true:</P>

    <P>While <b>parallel</b> operations are both started at the
    same time and literally run simultaneously (which
    is only possible with multi-core CPUs), <b>concurrent</b> ones
    might both make process regardless of the other, but cannot
    run at the same time (suitable for single-core CPUs).<Ref id="1"/></P>

    <P>Let me clarify that with an example:</P>

    <Code>{`setInterval(() => {
  console.log('interval executed')
}, 1000)

loadDataSync()`}</Code>

    <P>As you can see, I{`'`}m handling two tasks: The first three lines
    introduce an interval that gets executed every 1000 milliseconds (one second) and the last line
    calls an arbitrary function which is doing something in a synchronous way.</P>

    <P>Now the interesting part:</P>

    <P>Although the code for starting the interval gets executed <b>before</b> the synchronous function
    gets called, the callback inside <InlineCode>setInterval()</InlineCode> won{'\''}t be run before
    {' '}<InlineCode>loadDataSync()</InlineCode> has returned something.</P>

    <P>This is because of Node.js{`'`} concurrent nature. Its backbone consists of a
    single-threaded event loop and therefore doesn{`'`}t allow for operations running in parallel
    out of the box.</P>

    <P>Or as Panu from <Link href="https://bytearcher.com">Byte Archer</Link> puts it:</P>

    <Quote>The event-loop repeatedly takes an event and fires any event handlers listening to that event
    one at a time. No JavaScript code is ever executed in parallel.
    <br/><br/>
    As long as the event handlers are small and frequently wait for yet more events
    themselves, all computations (for example fulfilling and serving a HTTP
    request) can be thought as advancing one small step at a time - concurrently. This
    is beneficial in web applications where the majority of the time is spent waiting
    for I/O to complete. It allows single Node.js process to handle huge amounts of requests.</Quote>

    <P>So technically, nothing can guarantee you that intervals in Node.js will always get executed
    on the exact times you{`'`}ve defined. Instead, the execution of the callback will
    be enqueued on a certain point in time, but will only start once the thread isn{`'`}t handling
    any other operation.</P>

    <P>As an example, the <InlineCode>loadDataSync()</InlineCode> function call shown in the
    code snippet above might take - let{`'`}s say - a whole minute to download some data. This would mean
    that the callback of <InlineCode>setInterval()</InlineCode> will get enqueued after 1000 milliseconds (one second),
    but not actually executed until the minute is over.</P>

    <P>Because a minute contains 60 seconds,
    in our example, the callback execution would therefore get enqueued 60 times. In
    turn, you{`'`}ll get the message logged to the console 60 times
    immediately after the data was downloaded (triggered by the synchronous function).</P>

    <H2>Quick! <InlineCode>await</InlineCode> To the Rescue!</H2>

    <P>To solve this problem, we need to make the operation
    for pulling the data non-blocking. At the moment,
    it{`'`}s still synchronous and therefore making the process{`'`} performance plummet.</P>

    <P>Here{`'`}s how it looks with <InlineCode>await</InlineCode>:</P>

    <Code>{`setInterval(() => {
  console.log('Interval dispatched')
}, 1000)

await loadData()
console.log('Data downloaded')`}</Code>

    <P>To make this work, you would also have to rewrite your sychronous function into an asynchronous
    one (either a <InlineCode>Promise</InlineCode> or a function
    prefixed with <InlineCode>async</InlineCode>).</P>

    <P>To make my point clear, I came up with a
    snippet that simulates the case of <InlineCode>loadData()</InlineCode> taking 5000 milliseconds
    to finish:</P>

    <Code>{`const loadData = () => new Promise(resolve => {
  setTimeout(resolve, 5000)
})`}</Code>

    <P>Now the data is being downloaded <b>while</b> the interval{`'`}s callback
    gets executed every 1000 milliseconds. The operation
    can be called {`"`}non-blocking{`"`} now. In turn, we got the maximum
    of performance out of our simple script:</P>

    <Image src="/static/essays/2017/multithreading-node/non-blocking.gif" width="500"/>

    <FootNotes>
      <Note id="1">If you want to deeply understand the difference between
      concurrency and parallelism and why Node.js only comes with the former way
      of processing code, I highly recommend
      reading <Link href="https://bytearcher.com/articles/parallel-vs-concurrent/">this</Link>.</Note>
    </FootNotes>
  </Post>
)
