// Syntax
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'

// Layouts
import Post from '../../layouts/essay'

// Components
import P from '../../components/paragraph'
import { Code, InlineCode } from '../../components/code'
import Meta from '../../components/meta'

export default () => (
  <Post>
    <Meta id="navigation-css" />

    <P>
      Schon wieder ein Thema, bei dem man einige unbrauchbare Scripte
      und Funktionen weglassen kann. Denn diese verlängern die
      Ladezeiten und lassen die Navi nicht wirklich gut auf
      gleichgesinnte Webentwickler und Coder wirken.
    </P>

    <P>
      In diesem Beitrag werde ich ihnen ganz einfach vorstellen, wie sie
      eine eigene Unternavigation für ihr Menü erstellen, und das ganz
      ohne Javascript oder ähnliche Anwendungs-Scripte, die Funktionen
      von Nöten haben.
    </P>

    <P>
      Zunächst sollte eine einfache Navigation erstellt werden. Diese
      kann etwa wie folgt aussehen (ich stelle hier die Navigation
      ohne eine CSS-Formatierung dar):
    </P>

    <Code language="xml" syntax={xml}>
      {`<ul>
  <li><a href="#">Erster Link</a></li>
  <li><a href="#">Zweiter Link</a></li>
  <li><a href="#">Dritter Link</a></li>
</ul>`}
    </Code>

    <P>
      Nun nehmen wir uns einen Link heraus und starten damit, ihm
      ein Untermenü zu verpassen. Hierfür stellen wir wieder
      zunächst den HTML-Code auf:
    </P>

    <Code language="xml" syntax={xml}>
      {`<ul>
  <li><a href="#">Zweiter Link</a>
      <ul>
        <li><a href="#">Erster Unterlink</a></li>
        <li><a href="#">Zweiter Unterlink</a></li>
      </ul>
  </li>
</ul>`}
    </Code>

    <P>
      Wie man unschwer erkennen kann, wird die das LI-Element des
      normalen Navigationspunktes über ein UL-Element gezogen, welches
      die Punkte des Untermenüs enthält. Diese werden ganz
      normal in LIs aufgeteilt.
    </P>

    <P>Nun geht es um den CSS-Teil, dieser hat höchste Priorität:</P>

    <Code language="css" syntax={css}>
      {`li ul { display: none; }    // UL der Unternavigation ausblenden
li:hover ul { display: block; }    // UL bei Hover einblenden`}
    </Code>

    <P>
      Und schon ist die Navigation fertig. Absolut ohne Javascript, sondern
      aus reinem CSS und HTML. Nach Wunsch können
      für <InlineCode>display</InlineCode> auch andere Attribute
      wie
      {' '}
      <InlineCode>height</InlineCode>
      {' '}
      oder
      {' '}
      <InlineCode>visibility</InlineCode>
      {' '}
      verwendet
      werden. Auch CSS3-Transitions sind erlaubt.
    </P>
  </Post>
)
