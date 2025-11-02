const form = document.getElementById('memoryForm');
const memoriesDiv = document.getElementById('memories');
const STORAGE_KEY = 'memory_vault_local_v1';

function loadMemoriesFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch(e) {
    console.error('Failed to parse localStorage', e);
    return [];
  }
}

function saveMemoriesToStorage(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function formatFileInfo(file) {
  if(!file) return {name:'(no file)', type:'', size:0};
  return {name: file.name, type: file.type, size: file.size};
}

function renderMemories() {
  const list = loadMemoriesFromStorage();
  memoriesDiv.innerHTML = '';
  if(list.length === 0) {
    memoriesDiv.innerHTML = '<p style="color:#94a3b8">No memories yet. Add one above.</p>';
    return;
  }
  list.slice().reverse().forEach(mem => {
    const el = document.createElement('div');
    el.className = 'memory';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<h3>${escapeHtml(mem.title)}</h3>
                      <p>${escapeHtml(mem.description || '')}</p>
                      <p style="font-size:12px;color:#94a3b8">Type: ${mem.file?.type||'n/a'} • ${mem.file?.name||'no file'} • ${humanFileSize(mem.file?.size||0)}</p>`;
    const actions = document.createElement('div');
    actions.className = 'actions';

    if(mem.dataUrl) {
      // preview link ke liyeh images/audio/video/pdf
      const preview = document.createElement('a');
      preview.className = 'btn';
      preview.textContent = 'Preview';
      preview.href = mem.dataUrl;
      preview.target = '_blank';
      actions.appendChild(preview);
    } else if(mem.file && !mem.dataUrl) {
      const info = document.createElement('span');
      info.textContent = mem.file.name;
      actions.appendChild(info);
    }

    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = 'Delete';
    del.onclick = () => {
      if(confirm('Delete this memory?')) {
        deleteMemory(mem.id);
      }
    };
    actions.appendChild(del);

    el.appendChild(meta);
    el.appendChild(actions);
    memoriesDiv.appendChild(el);
  });
}

function escapeHtml(s='') {
  return s.replaceAll && s.replaceAll('<','&lt;').replaceAll('>','&gt;') || s;
}

function humanFileSize(size) {
  if(size===0) return '0 B';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B','KB','MB','GB','TB'][i];
}

function deleteMemory(id) {
  let list = loadMemoriesFromStorage();
  list = list.filter(m => m.id !== id);
  saveMemoriesToStorage(list);
  renderMemories();
}

function generateId() {
  return 'm_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];

  if(!title) { alert('Please enter a title'); return; }

  const memory = { id: generateId(), title, description, createdAt: new Date().toISOString() };

  if(file) {

    const MAX_INLINE = 5 * 1024 * 1024;
    memory.file = formatFileInfo(file);
    if(file.size <= MAX_INLINE) {
      try {
        const dataUrl = await fileToDataUrl(file);
        memory.dataUrl = dataUrl;
      } catch(err) {
        console.warn('Failed to convert file to data URL', err);
      }
    } else {
      // store metadata Sirf large files ke liyeh
      memory.note = 'File too large for inline preview. Keep original locally.';
    }
  }

  const list = loadMemoriesFromStorage();
  list.push(memory);
  saveMemoriesToStorage(list);
  form.reset();
  renderMemories();
});

function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = () => rej(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

renderMemories();
