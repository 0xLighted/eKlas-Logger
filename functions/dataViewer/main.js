export default ({ req, res, log, error }) => {
    if (req.method != 'GET' || req.path != '/') {
        error('Method not allowed: ' + req.method);
        return res.json({success: false, message: "Method not allowed, Please send GET"});
      }
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appwrite React App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root"></div>
    <script src="bundle.js"></script>
    <script>
        renderApp({
            projectId: '${process.env.APPWRITE_FUNCTION_PROJECT_ID}',
            databaseId: 'Logger',
            collectionId: 'User'
        });
    </script>
</body>
</html>`;
    
    return res.text(html, 200, {
        'Content-Type': 'text/html'
    })
}