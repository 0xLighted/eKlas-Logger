import { html } from '../components/item'

export default ({ req, res, log, error }) => {
    return res.text(html, 200, {
        'Content-Type': 'text/html'
    })
}