// Helpers
import { createElement, Component } from 'react'
import { bool } from 'prop-types'

const Table = ({ children }) => (
  <table cellSpacing="0" cellPadding="5">
    {children}

    <style jsx>
      {`
      table {
        table-layout: fixed;
        width: 100%;
        margin: 30px -5px;
        border: none;
      }
    `}
    </style>
  </table>
)

class Row extends Component {
  getChildContext() {
    return {
      header: this.props.header || false
    }
  }

  render() {
    return (
      <tr>
        {this.props.children}

        <style jsx>
          {`
          tr {
            text-align: left;
            font-size: 15px;
          }
        `}
        </style>
      </tr>
    )
  }
}

Row.childContextTypes = {
  header: bool
}

const Column = ({ children }, context) =>
  createElement(context.header ? 'th' : 'td', {}, children)

Column.contextTypes = {
  header: bool
}

export { Table, Row, Column }
