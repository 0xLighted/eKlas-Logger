export default ({ req, res, log, error }) => {
    return res.text("<h1>hello world</h1>", 200, {
        'Content-Type': 'text/html'
    })
}