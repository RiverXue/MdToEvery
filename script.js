// 全局变量
let currentOutput = '';
let currentFormat = '';

// DOM元素
const markdownInput = document.getElementById('markdownInput');
const fileInput = document.getElementById('fileInput');
const pasteBtn = document.getElementById('pasteBtn');
const clearBtn = document.getElementById('clearBtn');
const convertTxtBtn = document.getElementById('convertTxt');
const convertWordBtn = document.getElementById('convertWord');
const convertHtmlBtn = document.getElementById('convertHtml');
const outputPreview = document.getElementById('outputPreview');
const outputText = document.getElementById('outputText');
const downloadBtn = document.getElementById('downloadBtn');

// 粘贴功能
pasteBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        markdownInput.value = text;
        markdownInput.focus();
        showNotification('✅ 已粘贴剪贴板内容');
    } catch (err) {
        showNotification('❌ 无法读取剪贴板，请手动粘贴', 'error');
    }
});

// 文件上传
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            markdownInput.value = event.target.result;
            showNotification('✅ 文件已加载');
        };
        reader.readAsText(file);
    }
});

// 清空功能
clearBtn.addEventListener('click', () => {
    markdownInput.value = '';
    outputText.value = '';
    outputPreview.innerHTML = '';
    outputText.classList.remove('active');
    outputPreview.classList.remove('active');
    downloadBtn.style.display = 'none';
    currentOutput = '';
    currentFormat = '';
    showNotification('🗑️ 已清空');
});

// Markdown转TXT（去除所有语法，纯文本）
convertTxtBtn.addEventListener('click', () => {
    const markdown = markdownInput.value.trim();
    if (!markdown) {
        showNotification('⚠️ 请输入Markdown内容', 'error');
        return;
    }

    try {
        // 去除Markdown语法的函数
        let text = markdown;
        
        // 移除代码块
        text = text.replace(/```[\s\S]*?```/g, '');
        text = text.replace(/`[^`]*`/g, (match) => {
            return match.replace(/`/g, '');
        });
        
        // 移除链接 [text](url) -> text
        text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
        
        // 移除图片
        text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
        
        // 移除粗体、斜体标记
        text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
        text = text.replace(/\*([^*]+)\*/g, '$1');
        text = text.replace(/__([^_]+)__/g, '$1');
        text = text.replace(/_([^_]+)_/g, '$1');
        
        // 移除删除线
        text = text.replace(/~~([^~]+)~~/g, '$1');
        
        // 移除标题标记
        text = text.replace(/^#{1,6}\s+/gm, '');
        
        // 移除列表标记
        text = text.replace(/^[\s]*[-*+]\s+/gm, '');
        text = text.replace(/^[\s]*\d+\.\s+/gm, '');
        
        // 移除引用标记
        text = text.replace(/^>\s+/gm, '');
        
        // 移除水平线
        text = text.replace(/^[-*_]{3,}$/gm, '');
        
        // 移除表格标记
        text = text.replace(/\|/g, ' ');
        text = text.replace(/^[\s]*:?-+:?[\s]*$/gm, '');
        
        // 清理多余空行（保留最多两个连续空行）
        text = text.replace(/\n{3,}/g, '\n\n');
        
        // 去除首尾空白
        text = text.trim();

        currentOutput = text;
        currentFormat = 'txt';
        
        outputText.value = text;
        outputText.classList.add('active');
        outputPreview.classList.remove('active');
        downloadBtn.style.display = 'block';
        
        showNotification('✅ 已转换为TXT格式');
    } catch (error) {
        showNotification('❌ 转换失败: ' + error.message, 'error');
    }
});

// Markdown转Word
convertWordBtn.addEventListener('click', async () => {
    const markdown = markdownInput.value.trim();
    if (!markdown) {
        showNotification('⚠️ 请输入Markdown内容', 'error');
        return;
    }

    try {
        // 使用marked解析Markdown为HTML
        const html = marked.parse(markdown);
        
        // 创建Word文档 - 使用docx库
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
        
        const doc = new Document({
            sections: [{
                properties: {},
                children: []
            }]
        });

        // 解析HTML并转换为Word格式
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(html, 'text/html');
        const body = htmlDoc.body;
        
        const paragraphs = [];
        
        // 递归处理节点
        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) {
                    return new TextRun(text);
                }
                return null;
            }
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                const children = [];
                
                // 收集所有子节点
                Array.from(node.childNodes).forEach(child => {
                    const result = processNode(child);
                    if (result) {
                        if (Array.isArray(result)) {
                            children.push(...result);
                        } else {
                            children.push(result);
                        }
                    }
                });
                
                if (tagName === 'h1') {
                    return new Paragraph({
                        children: children.length > 0 ? children : [new TextRun(node.textContent)],
                        heading: HeadingLevel.HEADING_1,
                        spacing: { after: 200 }
                    });
                } else if (tagName === 'h2') {
                    return new Paragraph({
                        children: children.length > 0 ? children : [new TextRun(node.textContent)],
                        heading: HeadingLevel.HEADING_2,
                        spacing: { after: 200 }
                    });
                } else if (tagName === 'h3') {
                    return new Paragraph({
                        children: children.length > 0 ? children : [new TextRun(node.textContent)],
                        heading: HeadingLevel.HEADING_3,
                        spacing: { after: 200 }
                    });
                } else if (tagName === 'p') {
                    if (children.length > 0) {
                        return new Paragraph({
                            children: children,
                            spacing: { after: 100 }
                        });
                    }
                } else if (tagName === 'strong' || tagName === 'b') {
                    return new TextRun({
                        text: node.textContent,
                        bold: true
                    });
                } else if (tagName === 'em' || tagName === 'i') {
                    return new TextRun({
                        text: node.textContent,
                        italics: true
                    });
                } else if (tagName === 'ul') {
                    const items = Array.from(node.querySelectorAll('li'));
                    return items.map(item => {
                        return new Paragraph({
                            text: item.textContent.trim(),
                            bullet: { level: 0 },
                            spacing: { after: 50 }
                        });
                    });
                } else if (tagName === 'ol') {
                    const items = Array.from(node.querySelectorAll('li'));
                    return items.map((item, index) => {
                        return new Paragraph({
                            text: item.textContent.trim(),
                            numbering: { reference: 'default-numbering', level: 0 },
                            spacing: { after: 50 }
                        });
                    });
                } else if (tagName === 'li') {
                    return new Paragraph({
                        text: node.textContent.trim(),
                        bullet: { level: 0 },
                        spacing: { after: 50 }
                    });
                } else if (tagName === 'br') {
                    return new Paragraph({ text: '' });
                } else if (children.length > 0) {
                    return children;
                }
            }
            
            return null;
        }
        
        // 处理body的所有直接子节点
        Array.from(body.childNodes).forEach(node => {
            const result = processNode(node);
            if (result) {
                if (Array.isArray(result)) {
                    paragraphs.push(...result);
                } else {
                    paragraphs.push(result);
                }
            }
        });
        
        // 如果没有段落，至少添加一个
        if (paragraphs.length === 0) {
            paragraphs.push(new Paragraph({ 
                children: [new TextRun(markdown)]
            }));
        }
        
        doc.sections[0].children = paragraphs;
        
        // 生成Word文档
        const blob = await Packer.toBlob(doc);
        currentOutput = blob;
        currentFormat = 'docx';
        
        // 显示预览（转换为纯文本预览）
        const previewText = markdown.replace(/[#*`\[\]()]/g, '').trim();
        outputText.value = previewText.substring(0, 500) + (previewText.length > 500 ? '...' : '');
        outputText.classList.add('active');
        outputPreview.classList.remove('active');
        downloadBtn.style.display = 'block';
        
        showNotification('✅ 已转换为Word格式，点击下载');
    } catch (error) {
        console.error('Word转换错误:', error);
        // 如果docx库失败，使用HTML转Word的备用方案
        try {
            const html = marked.parse(markdown);
            // 创建HTML格式的Word文档（.doc格式，Word可以打开）
            const wordHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; }
        h1, h2, h3 { color: #333; margin-top: 20px; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
            const blob = new Blob(['\ufeff' + wordHtml], { 
                type: 'application/msword;charset=utf-8' 
            });
            currentOutput = blob;
            currentFormat = 'doc';
            outputText.value = markdown.replace(/[#*`\[\]()]/g, '').trim().substring(0, 500);
            outputText.classList.add('active');
            outputPreview.classList.remove('active');
            downloadBtn.style.display = 'block';
            showNotification('✅ 已转换为Word格式（.doc），点击下载');
        } catch (fallbackError) {
            showNotification('❌ Word转换失败: ' + error.message, 'error');
        }
    }
});

// Markdown转HTML
convertHtmlBtn.addEventListener('click', () => {
    const markdown = markdownInput.value.trim();
    if (!markdown) {
        showNotification('⚠️ 请输入Markdown内容', 'error');
        return;
    }

    try {
        const html = marked.parse(markdown);
        currentOutput = html;
        currentFormat = 'html';
        
        outputPreview.innerHTML = html;
        outputPreview.classList.add('active');
        outputText.classList.remove('active');
        downloadBtn.style.display = 'block';
        
        showNotification('✅ 已转换为HTML格式');
    } catch (error) {
        showNotification('❌ HTML转换失败: ' + error.message, 'error');
    }
});

// 兼容移动端的下载函数
function downloadFile(blob, fileName) {
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // 创建 blob URL
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    // iOS Safari 特殊处理
    if (isIOS) {
        // iOS 不支持直接下载，在新窗口打开
        // 对于文本文件，可以尝试复制到剪贴板
        if (blob.type.includes('text/plain') || blob.type.includes('text/html')) {
            // 尝试读取内容并复制到剪贴板
            blob.text().then(text => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(() => {
                        showNotification('✅ 内容已复制到剪贴板，可粘贴到其他应用', 'success');
                        URL.revokeObjectURL(url);
                    }).catch(() => {
                        // 如果复制失败，在新窗口打开
                        window.open(url, '_blank');
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                    });
                } else {
                    // 不支持剪贴板，在新窗口打开
                    window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                }
            }).catch(() => {
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
            return;
        } else {
            // 非文本文件，在新窗口打开
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            return;
        }
    }
    
    // 移动端（非iOS）和桌面端使用链接下载
    if (isMobile) {
        // Android 等移动浏览器
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 200);
    } else {
        // 桌面端优先使用 FileSaver.js
        try {
            if (typeof saveAs !== 'undefined') {
                saveAs(blob, fileName);
                // FileSaver 会自动处理，但我们还是清理 URL
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
                // FileSaver 未加载，使用链接方式
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 200);
            }
        } catch (error) {
            // 如果 FileSaver 失败，回退到链接方式
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 200);
        }
    }
}

// 下载功能
downloadBtn.addEventListener('click', () => {
    if (!currentOutput) {
        showNotification('⚠️ 没有可下载的内容', 'error');
        return;
    }

    try {
        const markdown = markdownInput.value.trim();
        // 生成更安全的文件名
        let fileName = markdown.substring(0, 30).replace(/[^\w\s\u4e00-\u9fa5]/g, '').trim() || 'converted';
        // 移除多余空格
        fileName = fileName.replace(/\s+/g, '_');
        
        let blob;
        let fileExtension;
        
        if (currentFormat === 'txt') {
            blob = new Blob([currentOutput], { type: 'text/plain;charset=utf-8' });
            fileExtension = 'txt';
        } else if (currentFormat === 'docx') {
            blob = currentOutput; // 已经是 Blob
            fileExtension = 'docx';
        } else if (currentFormat === 'doc') {
            blob = currentOutput; // 已经是 Blob
            fileExtension = 'doc';
        } else if (currentFormat === 'html') {
            blob = new Blob([currentOutput], { type: 'text/html;charset=utf-8' });
            fileExtension = 'html';
        } else {
            throw new Error('未知的格式类型');
        }
        
        const fullFileName = `${fileName}.${fileExtension}`;
        
        // iOS 设备会显示特殊提示，其他设备显示下载成功
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (!isIOS || (!blob.type.includes('text/plain') && !blob.type.includes('text/html'))) {
            // 非iOS或非文本文件，显示下载提示
            downloadFile(blob, fullFileName);
            showNotification('✅ 文件已下载');
        } else {
            // iOS文本文件，会在downloadFile中显示复制提示
            downloadFile(blob, fullFileName);
        }
    } catch (error) {
        console.error('下载错误:', error);
        showNotification('❌ 下载失败: ' + error.message, 'error');
    }
});

// 通知函数
function showNotification(message, type = 'success') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.textContent = message;
    
    // 苹果风格颜色
    const colors = {
        success: {
            bg: 'rgba(52, 199, 89, 0.95)',
            text: '#FFFFFF'
        },
        error: {
            bg: 'rgba(255, 59, 48, 0.95)',
            text: '#FFFFFF'
        }
    };
    
    const color = colors[type] || colors.success;
    
    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 768;
    
    notification.style.cssText = `
        position: fixed;
        top: ${isMobile ? '16px' : '32px'};
        ${isMobile ? 'left: 16px; right: 16px;' : 'right: 32px;'}
        background: ${color.bg};
        backdrop-filter: blur(40px) saturate(200%);
        -webkit-backdrop-filter: blur(40px) saturate(200%);
        color: ${color.text};
        padding: ${isMobile ? '14px 20px' : '16px 24px'};
        border-radius: ${isMobile ? '14px' : '16px'};
        box-shadow: 
            0 12px 32px rgba(0, 0, 0, 0.2),
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 1px 3px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        z-index: 10000;
        animation: slideIn 0.5s cubic-bezier(0.33, 1, 0.68, 1);
        font-weight: 500;
        font-size: ${isMobile ? '15px' : '15px'};
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        letter-spacing: -0.2px;
        border: 0.5px solid rgba(255, 255, 255, 0.25);
        max-width: ${isMobile ? '100%' : '360px'};
        word-wrap: break-word;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        touch-action: manipulation;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 3500);
}

// CSS动画已在style.css中定义

