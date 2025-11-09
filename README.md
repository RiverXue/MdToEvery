# 📝 Markdown转换工具

一个简单易用的Web工具，将AI生成的Markdown内容转换为TXT、Word等格式，方便分享。

🌐 **在线访问**：[https://riverxue.github.io/MdToEvery/](https://riverxue.github.io/MdToEvery/)

## ✨ 功能特点

- 🔄 **Markdown转TXT**：去除所有Markdown语法，生成纯文本文件
- 📘 **Markdown转Word**：保留格式（标题、粗体、列表等），生成.docx文件
- 🌐 **Markdown转HTML**：转换为HTML格式，便于预览
- 📋 **多种输入方式**：支持粘贴、文件上传
- 📱 **响应式设计**：完美支持手机和电脑端
- ⚡ **纯前端实现**：无需服务器，直接在浏览器使用

## 🚀 使用方法

### 方法一：直接打开（推荐）

1. 下载所有文件到本地
2. 双击打开 `index.html` 文件
3. 在浏览器中使用

### 方法二：部署到服务器

1. 将所有文件上传到Web服务器
2. 通过浏览器访问 `index.html`

### 方法三：GitHub Pages（已部署）

✅ **项目已部署到GitHub Pages**

🌐 **在线访问**：[https://riverxue.github.io/MdToEvery/](https://riverxue.github.io/MdToEvery/)

**部署步骤**：
1. 访问仓库：https://github.com/RiverXue/MdToEvery
2. 进入 Settings → Pages
3. 选择 Source: main branch
4. 保存后等待1-2分钟即可访问

详细部署说明请查看：[GitHub_Pages部署指南.md](./GitHub_Pages部署指南.md)

## 📖 使用步骤

1. **输入内容**
   - 点击"粘贴"按钮自动粘贴剪贴板内容
   - 或点击"上传文件"选择.md文件
   - 或直接在文本框中输入/粘贴Markdown内容

2. **选择转换格式**
   - 点击"转TXT"：生成纯文本文件（去除所有Markdown语法）
   - 点击"转Word"：生成Word文档（保留格式）
   - 点击"转HTML"：生成HTML文件（可在浏览器中查看）

3. **下载文件**
   - 转换完成后，点击"下载文件"按钮
   - 文件会自动下载到本地

## 🎯 适用场景

- ✅ AI生成的Markdown内容需要分享给他人
- ✅ 需要去除Markdown语法，只保留纯文本
- ✅ 需要将Markdown转换为Word文档
- ✅ 需要快速预览Markdown渲染效果

## 💡 技术说明

- **纯前端实现**：使用HTML + CSS + JavaScript
- **核心库**：
  - `marked`：Markdown解析
  - `docx`：Word文档生成
  - `FileSaver.js`：文件下载

## 📝 文件说明

- `index.html` - 主页面
- `style.css` - 样式文件
- `script.js` - 主要功能逻辑
- `README.md` - 使用说明

## 🔧 浏览器兼容性

- Chrome/Edge（推荐）
- Firefox
- Safari
- 移动端浏览器

## 📄 许可证

MIT License - 自由使用和修改

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**提示**：如果遇到问题，请确保浏览器支持现代JavaScript特性，并检查网络连接（需要加载CDN资源）。

