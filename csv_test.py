import csv

# CSV 파일 읽기
with open('./3.csv', mode='r', encoding='utf-8') as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)  # 각 행의 데이터를 리스트 형태로 출력
