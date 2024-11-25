import { html } from '../components/item.js'

export default ({ req, res, log, error }) => {
    return res.text(html, 200, {
        'Content-Type': 'text/html'
    })
}