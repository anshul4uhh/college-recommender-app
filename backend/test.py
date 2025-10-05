import google.generativeai as genai
genai.configure(api_key="AIzaSyAuFjbDx0oq7fllqdLc2bYcpLphCAUTJHI")

for m in genai.list_models():
    print(m.name)