import markdown from 'markdown-in-js'
import asPost from '../../layouts/post'
import components from '../../components'

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

`)
