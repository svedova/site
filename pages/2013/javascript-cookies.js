// Syntax
import js from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'

// Layouts
import Post from '../../layouts/essay'

// Components
import P from '../../components/paragraph'
import Meta from '../../components/meta'
import { Code } from '../../components/code'

export default () => (
  <Post>
    <Meta id="javascript-cookies" />

    <P>
      Da PHP die Funktionen, die mit Cookies zutun haben, bekannter
      Weise ja nur aktiviert, wenn die jeweilige Datei neu geladen
      wird, dachte ich mir, dass ich mal einen kleinen Artikel
      darüber schreibe, wie man Cookies über Javascript setzt, ausliest
      und wieder entfernt. All diese Funktionen können
      verwenden werden, auch ohne, dass die aufgerufene
      Datei neu geladen werden muss.
    </P>

    <P>
      Ich habe ein paar kleine Funktionen dafür vorbereitet, welche das
      jeweilige Cookie setzen, auslesen und sogar aus dem
      Speicher löschen können.
    </P>

    <P>Hier die Funktion für das Setzen eines neuen Cookies mit einem Wert:</P>

    <Code language="javascript" syntax={js}>
      {`function set_cookie( my_cookie, value, days ) {

  if(days) {
    var date = new Date();
    date.setTime( date.getTime() + ( days*24*60*60*1000 ) );
    var expires = "; expires=" + date.toGMTString();
  } else {
    expires = ""
  }

  document.cookie = my_cookie + "=" + value + expires + "; path=/";

}`}
    </Code>

    <P>Hiermit lässt sich das gesetzte Cookie ganz einfach auslesen:</P>

    <Code language="xml" syntax={xml}>
      {`function read_cookie( my_cookie ) {

  var my_cookie_eq = my_cookie + "=";
  var ca = document.cookie.split( ';' );

  for( var i=0; i < ca.length; i++ ) {
    var c = ca[i];

    while ( c.charAt(0) == ' ' ) {
      c = c.substring( 1, c.length );
    }

    if ( c.indexOf( my_cookie_eq ) == 0 ) {
      return c.substring( my_cookie_eq.length, c.length );
    }

  }

  return null;

}`}
    </Code>

    <P>
      Diese Funktion setzt die offizielle Haltbarkeit des Cookies ins
      Negative, wodurch dieses logischer Weiße aus dem
      Browser-Cache entfernt wird:
    </P>

    <Code language="javascript" syntax={js}>
      {`function delete_cookie( my_cookie ) {
  set_cookie( my_cookie, "", -1 );
}`}
    </Code>

    <P>
      Setze die obigen Codes einfach auf deiner Homepage ein und
      beginne damit, von den Vorteilen der Flexibilität von
      Javascript gegenüber PHP zu profitieren.
    </P>
  </Post>
)
