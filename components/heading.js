// Helpers
import { createElement } from 'react'
import toID from 'to-id'

const H = ({ level, fontSize, linked, children }) => {
  let idBase = children

  if (Array.isArray(children)) {
    idBase = children
      .map(item => {
        if (typeof item === 'string') {
          return item
        }

        return item.props.children
      })
      .join('')
  }

  return (
    <div>
      {createElement(
        `h${level}`,
        {
          style: {
            fontWeight: 700,
            fontSize,
            lineHeight: '1.5em'
          }
        },
        linked &&
          <span>
            <a href={`#${toID(idBase)}`} id={toID(idBase)}>#</a>
          </span>,
        children
      )}

      <style jsx>
        {`
        div {
          margin-top: 30px;
        }

        span {
          position: absolute;
          margin-left: -15px;
          width: 15px;
        }

        a {
          text-decoration: none;
          color: #4492ff;
          padding-top: 30px;
        }

        a:focus {
          outline: none;
        }

        @media (min-width: 922px) {
          a {
            visibility: hidden;
          }

          div:hover a,
          span:hover a {
            visibility: visible;
          }
        }
      `}
      </style>
    </div>
  )
}

for (let level = 1; level <= 6; level++) {
  const tag = `H${level}`

  const sizes = [23, 18, 15, 13, 10, 9]

  const component = props =>
    new H({
      ...props,
      level,
      fontSize: sizes[level - 1],
      linked: level > 1
    })

  exports[tag] = component
}
