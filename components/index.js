// Components
import P from './paragraph'
import { UL, OL, LI } from './list'
import Link from './link'
import { Code, InlineCode } from './code'
import Quote from './quote'
import { Image } from './figure'
import HR from './hr'

export default {
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  a: Link,
  code: InlineCode,
  pre: Code,
  blockquote: Quote,
  img: Image,
  hr: HR
}
