import random
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/daily_words')
def fetch_daily_words():
    categories = ["casual", "professional", "food_drink"]
    category = random.choice(categories)
    words = list(app.config['vocab_data'][category].keys())
    daily_words = random.sample(words, 3)

    return jsonify({
        "context": category,
        "words": daily_words
    })

if __name__ == '__main__':
    with open('/home/jcverdie/src/english/vocabulary.json') as file:
        vocab_data = json.load(file)
    
    app.config['vocab_data'] = vocab_data
    app.run(debug=True, host='0.0.0.0')
