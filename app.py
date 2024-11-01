from flask import Flask, request, jsonify, render_template  # render_template 추가
import openai
import pandas as pd
import re

# Flask 앱 생성
app = Flask(__name__)

# OpenAI API 키 설정
openai.api_key = "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"

csv_file_path = "./3.csv"

# CSV 파일 로드
moving_centers_updated = pd.read_csv(csv_file_path)

def get_moving_centers_info(location):
    centers = moving_centers_updated[moving_centers_updated['area'].str.contains(location, case=False)]
    if not centers.empty:
        response = f"<strong>{location} 근처의 이삿짐 센터 목록입니다:</strong><br><ul>"
        for index, row in centers.iterrows():
            response += (
                f"<li><strong>{index + 1}. {row['name']}</strong><br>"
                f"   주소: {row['address']}<br>"
                f"   전화번호: {row['number']}</li><br>"
            )
        response += "</ul>"
        return response.strip()
    else:
        return f"<strong>{location} 근처에 추천할 이삿짐 센터가 없습니다.</strong>"

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get("user_input", "")
    
    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    # 특정 지역 질의인지 확인
    location_match = re.search(r"(.*) 근처 이삿짐 센터", user_input)
    if location_match:
        location = location_match.group(1).strip()
        bot_response = get_moving_centers_info(location)
    else:
        # OpenAI API로 일반 질문에 답변 생성
        completion = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant specialized in providing information about moving and moving services."},
                {"role": "user", "content": user_input}
            ]
        )
        bot_response = completion.choices[0].message["content"]



