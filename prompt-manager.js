// AI提示词管理器
// 使用LocalStorage存储数据

// 数据模型
let prompts = [];
let currentTags = [];
let currentRating = 0;
let currentEditId = null;

// DOM元素
const addPromptForm = document.getElementById('addPromptForm');
const editPromptForm = document.getElementById('editPromptForm');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const promptList = document.getElementById('promptList');
const tagsInput = document.getElementById('tagsInput');
const tagInput = document.getElementById('tagInput');
const tagsDisplay = document.getElementById('tagsDisplay');
const ratingContainer = document.getElementById('ratingContainer');
const editRatingContainer = document.getElementById('editRatingContainer');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const resetFormBtn = document.getElementById('resetFormBtn');
const editModal = document.getElementById('editModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPrompts();
    setupEventListeners();
    updateStats();
    renderPrompts();
    setupFormToggle();
});

// 设置表单折叠/展开
function setupFormToggle() {
    const formToggle = document.getElementById('formToggle');
    const promptForm = document.getElementById('promptForm');
    
    if (formToggle && promptForm) {
        formToggle.addEventListener('click', () => {
            promptForm.classList.toggle('collapsed');
        });
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 添加提示词表单
    addPromptForm.addEventListener('submit', handleAddPrompt);
    
    // 编辑提示词表单
    editPromptForm.addEventListener('submit', handleEditPrompt);
    
    // 搜索
    searchInput.addEventListener('input', handleSearch);
    
    // 筛选
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.category));
    });
    
    // 标签输入
    tagInput.addEventListener('keydown', handleTagInput);
    
    // 评分
    setupRating(ratingContainer, (rating) => {
        currentRating = rating;
        document.getElementById('promptRating').value = rating;
    });
    
    setupRating(editRatingContainer, (rating) => {
        document.getElementById('editPromptRating').value = rating;
    });
    
    // 导入/导出
    importBtn.addEventListener('click', handleImport);
    exportBtn.addEventListener('click', handleExport);
    
    // 重置表单
    resetFormBtn.addEventListener('click', resetForm);
    
    // 取消编辑
    cancelEditBtn.addEventListener('click', () => {
        editModal.classList.remove('active');
        resetEditForm();
    });
    
    // 点击模态框外部关闭
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.remove('active');
            resetEditForm();
        }
    });
    
    // 使用事件委托处理提示词操作（只添加一次）
    promptList.addEventListener('click', handlePromptAction);
}

// 设置评分功能
function setupRating(container, callback) {
    const stars = container.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            updateRatingDisplay(container, rating);
            callback(rating);
        });
        star.addEventListener('mouseenter', () => {
            updateRatingDisplay(container, index + 1, true);
        });
    });
    container.addEventListener('mouseleave', () => {
        const currentRating = parseInt(container.dataset.currentRating || '0');
        updateRatingDisplay(container, currentRating);
    });
}

function updateRatingDisplay(container, rating, isHover = false) {
    const stars = container.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    if (!isHover) {
        container.dataset.currentRating = rating;
    }
}

// 标签输入处理
function handleTagInput(e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tag = tagInput.value.trim();
        if (tag && !currentTags.includes(tag)) {
            currentTags.push(tag);
            tagInput.value = '';
            renderTags();
        }
    } else if (e.key === 'Backspace' && tagInput.value === '' && currentTags.length > 0) {
        currentTags.pop();
        renderTags();
    }
}

// 渲染标签
function renderTags() {
    tagsDisplay.innerHTML = '';
    currentTags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.innerHTML = `${tag} <span class="tag-remove" data-tag="${tag}">×</span>`;
        tagEl.querySelector('.tag-remove').addEventListener('click', () => {
            currentTags = currentTags.filter(t => t !== tag);
            renderTags();
        });
        tagsDisplay.appendChild(tagEl);
    });
}

// 添加提示词
function handleAddPrompt(e) {
    e.preventDefault();
    
    const title = document.getElementById('promptTitle').value.trim();
    const category = document.getElementById('promptCategory').value;
    const content = document.getElementById('promptContent').value.trim();
    const description = document.getElementById('promptDescription').value.trim();
    const rating = currentRating || 0;
    const tags = [...currentTags];
    
    if (!title || !category || !content) {
        showNotification('⚠️ 请填写必填项', 'error');
        return;
    }
    
    const prompt = {
        id: Date.now().toString(),
        title,
        category,
        content,
        description,
        rating,
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    prompts.push(prompt);
    savePrompts();
    updateStats();
    renderPrompts();
    resetForm();
    showNotification('✅ 提示词已保存');
}

// 编辑提示词
function handleEditPrompt(e) {
    e.preventDefault();
    
    const id = document.getElementById('editPromptId').value;
    const title = document.getElementById('editPromptTitle').value.trim();
    const category = document.getElementById('editPromptCategory').value;
    const content = document.getElementById('editPromptContent').value.trim();
    const description = document.getElementById('editPromptDescription').value.trim();
    const rating = parseInt(document.getElementById('editPromptRating').value) || 0;
    const tags = document.getElementById('editPromptTags').value.split(',').map(t => t.trim()).filter(t => t);
    
    if (!title || !category || !content) {
        showNotification('⚠️ 请填写必填项', 'error');
        return;
    }
    
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
        prompt.title = title;
        prompt.category = category;
        prompt.content = content;
        prompt.description = description;
        prompt.rating = rating;
        prompt.tags = tags;
        prompt.updatedAt = new Date().toISOString();
        
        savePrompts();
        updateStats();
        renderPrompts();
        editModal.classList.remove('active');
        resetEditForm();
        showNotification('✅ 提示词已更新');
    }
}

// 打开编辑模态框
function openEditModal(prompt) {
    currentEditId = prompt.id;
    document.getElementById('editPromptId').value = prompt.id;
    document.getElementById('editPromptTitle').value = prompt.title;
    document.getElementById('editPromptCategory').value = prompt.category;
    document.getElementById('editPromptContent').value = prompt.content;
    document.getElementById('editPromptDescription').value = prompt.description || '';
    document.getElementById('editPromptTags').value = prompt.tags.join(', ');
    document.getElementById('editPromptRating').value = prompt.rating || 0;
    
    updateRatingDisplay(editRatingContainer, prompt.rating || 0);
    editModal.classList.add('active');
}

// 重置编辑表单
function resetEditForm() {
    currentEditId = null;
    editPromptForm.reset();
    document.getElementById('editPromptRating').value = 0;
    updateRatingDisplay(editRatingContainer, 0);
}

// 删除提示词
function deletePrompt(id) {
    if (confirm('确定要删除这个提示词吗？')) {
        prompts = prompts.filter(p => p.id !== id);
        savePrompts();
        updateStats();
        renderPrompts();
        showNotification('🗑️ 提示词已删除');
    }
}

// 复制提示词
function copyPrompt(content) {
    navigator.clipboard.writeText(content).then(() => {
        showNotification('✅ 已复制到剪贴板');
    }).catch(() => {
        showNotification('❌ 复制失败', 'error');
    });
}

// 搜索处理
let searchTimeout;
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        renderPrompts();
    }, 300);
}

// 筛选处理
let currentFilter = '';
function handleFilter(category) {
    currentFilter = category;
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    renderPrompts();
}

// 渲染提示词列表
function renderPrompts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let filtered = prompts;
    
    // 搜索筛选
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchTerm) ||
            p.content.toLowerCase().includes(searchTerm) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // 分类筛选
    if (currentFilter) {
        filtered = filtered.filter(p => p.category === currentFilter);
    }
    
    // 按更新时间排序
    filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    if (filtered.length === 0) {
        promptList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>没有找到提示词</h3>
                <p>试试调整搜索条件或筛选器</p>
            </div>
        `;
        return;
    }
    
    promptList.innerHTML = filtered.map(prompt => `
        <div class="prompt-card" data-prompt-id="${prompt.id}">
            <div class="prompt-header">
                <div>
                    <div class="prompt-title">${escapeHtml(prompt.title)}</div>
                    <span class="prompt-category">${escapeHtml(prompt.category)}</span>
                </div>
                ${prompt.rating > 0 ? `<div style="color: var(--apple-orange);">${'⭐'.repeat(prompt.rating)}</div>` : ''}
            </div>
            ${prompt.description ? `<div style="color: var(--apple-text-secondary); font-size: 13px; margin-bottom: var(--spacing-sm);">${escapeHtml(prompt.description)}</div>` : ''}
            <div class="prompt-content" id="content-${prompt.id}">${escapeHtml(prompt.content)}</div>
            ${prompt.content.length > 200 ? `<div class="prompt-expand-btn" onclick="toggleContent('${prompt.id}')">展开更多</div>` : ''}
            ${prompt.tags.length > 0 ? `
                <div class="prompt-tags">
                    ${prompt.tags.map(tag => `<span class="prompt-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="prompt-footer">
                <div class="prompt-footer-left">
                    ${formatDate(prompt.updatedAt)}
                </div>
                <div class="prompt-actions">
                    <button class="btn-icon copy" data-action="copy" data-prompt-id="${prompt.id}" title="复制">
                        📋
                    </button>
                    <button class="btn-icon edit" data-action="edit" data-prompt-id="${prompt.id}" title="编辑">
                        ✏️
                    </button>
                    <button class="btn-icon delete" data-action="delete" data-prompt-id="${prompt.id}" title="删除">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 处理提示词操作
function handlePromptAction(e) {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const promptId = e.target.closest('[data-prompt-id]')?.dataset.promptId;
    
    if (!action || !promptId) return;
    
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    switch (action) {
        case 'copy':
            copyPrompt(prompt.content);
            break;
        case 'edit':
            openEditModal(prompt);
            break;
        case 'delete':
            deletePrompt(promptId);
            break;
    }
}

// 更新统计信息
function updateStats() {
    const total = prompts.length;
    const categories = new Set(prompts.map(p => p.category)).size;
    const avgRating = prompts.length > 0 
        ? (prompts.reduce((sum, p) => sum + (p.rating || 0), 0) / prompts.length).toFixed(1)
        : '0';
    
    document.getElementById('totalPrompts').textContent = total;
    document.getElementById('totalCategories').textContent = categories;
    document.getElementById('avgRating').textContent = avgRating;
}

// 重置表单
function resetForm() {
    addPromptForm.reset();
    currentTags = [];
    currentRating = 0;
    document.getElementById('promptRating').value = 0;
    renderTags();
    updateRatingDisplay(ratingContainer, 0);
}

// 导入功能
function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data)) {
                    // 合并数据，避免重复ID
                    const existingIds = new Set(prompts.map(p => p.id));
                    const newPrompts = data.filter(p => !existingIds.has(p.id));
                    prompts = [...prompts, ...newPrompts];
                    savePrompts();
                    updateStats();
                    renderPrompts();
                    showNotification(`✅ 已导入 ${newPrompts.length} 个提示词`);
                } else {
                    showNotification('❌ 文件格式错误', 'error');
                }
            } catch (err) {
                showNotification('❌ 导入失败：' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// 导出功能
function handleExport() {
    if (prompts.length === 0) {
        showNotification('⚠️ 没有可导出的提示词', 'error');
        return;
    }
    
    const data = JSON.stringify(prompts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('✅ 已导出提示词');
}

// 保存到LocalStorage
function savePrompts() {
    try {
        localStorage.setItem('ai_prompts', JSON.stringify(prompts));
    } catch (err) {
        console.error('保存失败:', err);
        showNotification('❌ 保存失败，数据可能过大', 'error');
    }
}

// 从LocalStorage加载
function loadPrompts() {
    try {
        const data = localStorage.getItem('ai_prompts');
        if (data) {
            prompts = JSON.parse(data);
            // 确保数据格式正确
            prompts = prompts.map(p => ({
                ...p,
                tags: p.tags || [],
                rating: p.rating || 0,
                description: p.description || '',
                createdAt: p.createdAt || new Date().toISOString(),
                updatedAt: p.updatedAt || new Date().toISOString()
            }));
        }
    } catch (err) {
        console.error('加载失败:', err);
        prompts = [];
    }
}

// 工具函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
        }
        return `${hours}小时前`;
    } else if (days === 1) {
        return '昨天';
    } else if (days < 7) {
        return `${days}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// 通知功能（复用现有工具的通知系统）
function showNotification(message, type = 'success') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? 'var(--apple-red)' : 'var(--apple-green)'};
        color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--apple-shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s var(--ease-out);
        font-size: 14px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s var(--ease-out)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 切换内容展开/收起
function toggleContent(promptId) {
    const contentEl = document.getElementById(`content-${promptId}`);
    const btn = contentEl.nextElementSibling;
    
    if (contentEl) {
        contentEl.classList.toggle('expanded');
        if (btn && btn.classList.contains('prompt-expand-btn')) {
            btn.textContent = contentEl.classList.contains('expanded') ? '收起' : '展开更多';
        }
    }
}

// 全局函数
window.toggleContent = toggleContent;

