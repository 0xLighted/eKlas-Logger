from flask import Flask, render_template, request, make_response

app = Flask(__name__)

@app.route('/')
def index():
    resp = make_response(render_template('index.html'))
    resp.set_cookie(key='cookie1', value='apples')
    resp.set_cookie(key='PHPSESSID', value='USERLOGINNN')
    # return render_template('index.html')
    return resp

if __name__ == '__main__':
    app.run(debug=True)