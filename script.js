// Minimal chat client that uses OpenAI Chat Completions API (client-side for quick prototype).
// Replace the API key placeholder. For production, proxy requests via your server.

const workerUrl = 'https://lingering-sun-d0a7.carlosm4.workers.dev/'; // Cloudflare Worker URL

const systemPrompt = `You are a friendly, professional L'Oréal product and routine advisor. You ONLY answer questions about L'Oréal products and routines. If a user asks about anything unrelated to L'Oréal products or routines, politely refuse and say: 'Sorry, I can only answer questions about L'Oréal products and routines.' Answer concisely, in a helpful tone. Include product suggestions when relevant and guide users on application order. Use emojis sparingly to feel warm but professional.`;

const chatEl = document.getElementById('chat');
const form = document.getElementById('inputForm');
const promptInput = document.getElementById('prompt');

// Maintain conversation history
const messages = [
  { role: 'system', content: systemPrompt }
];

// The messages array maintains the full conversation history:
// const messages = [
//   { role: 'system', content: systemPrompt }
// ];
// Each user/assistant message is appended for every turn, enabling context-aware responses.

function appendMessage(text, cls='assistant'){
  const div = document.createElement('div');
  div.className = `message ${cls}`;
  div.innerText = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function setLoading(loading){
  // simple UX cue: disable input
  promptInput.disabled = loading;
  form.querySelector('button').disabled = loading;
}

// Use Cloudflare Worker for OpenAI requests
async function queryWorker(messages){
  const res = await fetch(workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
    },
    body: JSON.stringify({ messages })
  });

  if(!res.ok){
    const txt = await res.text();
    throw new Error(`Worker error: ${res.status} ${txt}`);
  }

  const data = await res.json();
  // Get the reply from OpenAI's response structure
  const assistantText = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? '';
  return assistantText.trim();
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const text = promptInput.value.trim();
  if(!text) return;

  appendMessage(`You: ${text}`, 'user');
  setLoading(true);

  // Add user's message to conversation history
  messages.push({ role: 'user', content: text });

  const thinking = document.createElement('div');
  thinking.className = 'message assistant';
  thinking.innerText = '...';
  chatEl.appendChild(thinking);
  chatEl.scrollTop = chatEl.scrollHeight;

  try{
    const reply = await queryWorker(messages);
    thinking.remove();
    appendMessage(reply, 'assistant');
    // Add assistant's reply to conversation history
    messages.push({ role: 'assistant', content: reply });
  }catch(err){
    thinking.remove();
    appendMessage('Sorry, something went wrong. Please try again.', 'assistant');
    console.error(err);
  }finally{
    setLoading(false);
    promptInput.value = '';
  }
});

// allow Enter to submit
promptInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    form.dispatchEvent(new Event('submit',{cancelable:true}));
  }
});

// User question is shown above the AI response via:
// appendMessage(`You: ${text}`, 'user');
// Input field is reset for next input via:
// promptInput.value = '';

