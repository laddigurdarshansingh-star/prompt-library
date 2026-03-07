/* ═══════════════════════════════════════════════════════════════
   Quick Save – Compact prompt saver (Tauri v2)
   ═══════════════════════════════════════════════════════════════ */

async function invoke(cmd, args) {
    if (window.__TAURI__ && window.__TAURI__.core) {
        return window.__TAURI__.core.invoke(cmd, args);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    if (window.__TAURI__ && window.__TAURI__.core) {
        return window.__TAURI__.core.invoke(cmd, args);
    }
    console.error('Tauri API not available');
    return null;
}

// ─── DOM ────────────────────────────────────────────────────────
const qsFolder = document.getElementById('qsFolder');
const qsName = document.getElementById('qsName');
const qsText = document.getElementById('qsText');
const qsSave = document.getElementById('qsSave');
const qsCancel = document.getElementById('qsCancel');
const qsClose = document.getElementById('qsClose');
const qsToast = document.getElementById('qsToast');

// ─── Init ───────────────────────────────────────────────────────
async function init() {
    // Load theme
    const settings = await invoke('get_settings');
    if (settings) {
        document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
    }

    // Load folders
    const folders = await invoke('get_folders');
    if (folders && folders.length > 0) {
        qsFolder.innerHTML = folders.map(f =>
            `<option value="${f.id}">${f.name} (${f.prompts.length})</option>`
        ).join('');
    } else {
        qsFolder.innerHTML = '<option value="">No folders</option>';
    }

    // Auto-focus the prompt text
    setTimeout(() => qsText.focus(), 150);
}

// ─── Save ───────────────────────────────────────────────────────
async function savePrompt() {
    const folderId = qsFolder.value;
    const name = qsName.value.trim();
    const text = qsText.value.trim();

    if (!folderId) return;
    if (!name || !text) {
        if (!name) qsName.focus();
        else qsText.focus();
        return;
    }

    await invoke('create_prompt', {
        folderId: folderId,
        name: name,
        text: text,
        tags: [],
        images: [],
    });

    // Show success toast then close
    qsToast.classList.add('visible');
    setTimeout(async () => {
        await invoke('close_quicksave');
    }, 600);
}

// ─── Close ──────────────────────────────────────────────────────
async function closeWindow() {
    await invoke('close_quicksave');
}

// ─── Event Listeners ────────────────────────────────────────────
qsSave.addEventListener('click', savePrompt);
qsCancel.addEventListener('click', closeWindow);
qsClose.addEventListener('click', closeWindow);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeWindow();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        savePrompt();
    }
});

// ─── Boot ───────────────────────────────────────────────────────
init();
