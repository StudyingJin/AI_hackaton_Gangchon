window.onload = function () {
  displayMessage(
    "손주",
    "무엇을 도와드릴까요?",
    "static/image/hGPT.jpg", // 이미지 경로가 맞는지 확인하세요
    "left",
    false
  );
  scrollToBottom();
};

document.getElementById("send-button").addEventListener("click", sendMessage);

document.getElementById("chat-input").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const input = document.getElementById("chat-input").value.trim();
  if (input === "") return;

  displayMessage("조부모", input, "static/image/hUSER.jpg", "right", true);

  document.getElementById("chat-input").value = "";
  document.getElementById("chat-input").focus();

  try {
    const response = await fetch('/chat', {  // Flask 서버의 /chat 엔드포인트에 POST 요청
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_input: input }),
    });

    if (response.ok) {
      const data = await response.json();
      displayMessage("손주", data.response, "static/image/hGPT.jpg", "left", false);
    } else {
      displayMessage("손주", "서버 오류가 발생했습니다. 다시 시도해 주세요.", "static/image/hGPT.jpg", "left", false);
    }
  } catch (error) {
    displayMessage("손주", `네트워크 오류가 발생했습니다: ${error.message}`, "static/image/hGPT.jpg", "left", false);
  }

  scrollToBottom();
}

function displayMessage(sender, message, imageUrl, alignment, isUser) {
  const messageContainer = document.getElementById("message-container");

  const messageElement = document.createElement("div");
  messageElement.classList.add("flex", "items-center", "gap-3", "p-4");

  const imageElement = `
    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12" 
         style='background-image: url("${imageUrl}");'></div>
  `;

  const messageContent = `
    <div class="flex flex-${isUser ? "1" : "none"} flex-col items-${alignment === "right" ? "end" : "start"}">
      <div class="flex items-${alignment === "right" ? "end" : "start"} gap-3">
        <div class="flex flex-1 flex-col gap-1 items-${alignment === "right" ? "end" : "start"}">
          <p class="text-[#101817] text-base font-bold leading-tight">${sender}</p>
          <p class="text-[#101817] text-base font-normal leading-normal bg-${isUser ? "[#e0f0ee]" : "[#f0f5f4]"} p-2 rounded-lg ${isUser ? "border border-[#00d1b2]" : ""} message-content">${message}</p>
        </div>
      </div>
    </div>
  `;

  if (alignment === "right") {
    messageElement.innerHTML = messageContent + imageElement;
  } else {
    messageElement.innerHTML = imageElement + messageContent;
  }

  messageContainer.appendChild(messageElement);
  scrollToBottom(); // 자동 스크롤
}
function scrollToBottom() {
  const messageContainer = document.getElementById("message-container");
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

const micButton = document.getElementById('mic-button');
const chatInput = document.getElementById('chat-input');

let recognition;
let recognizing = false;

if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'ko-KR';

  recognition.onstart = () => {
    recognizing = true;
    micButton.innerHTML = `<span>음성 입력 중...</span>`;
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    chatInput.value = transcript; // Place recognized text in input field
  };

  recognition.onerror = (event) => {
    console.error('음성 인식 오류:', event.error);
  };

  recognition.onend = () => {
    recognizing = false;
    micButton.innerHTML = `<span>음성 입력</span>`;
    document.getElementById("chat-input").focus(); // Keep focus on input field after speech ends
  };
}

micButton.addEventListener('click', () => {
  if (recognizing) {
    recognition.stop();
  } else {
    recognition.start();
  }
});