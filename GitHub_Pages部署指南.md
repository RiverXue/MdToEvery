# GitHub Pages 部署指南

## ✅ 第一步：代码已推送完成

你的代码已经成功推送到GitHub仓库：https://github.com/RiverXue/MdToEvery.git

## 🚀 第二步：启用GitHub Pages

### 方法一：通过GitHub网页界面（推荐）

1. **打开仓库页面**
   - 访问：https://github.com/RiverXue/MdToEvery
   - 确保你已经登录GitHub账号

2. **进入设置页面**
   - 点击仓库顶部的 **"Settings"**（设置）标签

3. **找到Pages设置**
   - 在左侧菜单中，向下滚动找到 **"Pages"** 选项
   - 点击进入Pages设置页面

4. **配置Pages**
   - 在 **"Source"**（源）部分，选择：
     - **Branch: main**
     - **Folder: / (root)**
   - 点击 **"Save"**（保存）按钮

5. **等待部署**
   - GitHub会自动开始部署
   - 通常需要1-2分钟
   - 部署完成后，你会看到绿色的成功提示

6. **访问你的网站**
   - 部署成功后，你的网站地址将是：
     ```
     https://riverxue.github.io/MdToEvery/
     ```
   - 这个地址会显示在Pages设置页面的顶部

### 方法二：通过GitHub Actions（自动部署）

如果你想要自动部署，可以创建一个GitHub Actions工作流：

1. 在仓库中创建 `.github/workflows/deploy.yml` 文件
2. 配置自动部署工作流

## 📝 注意事项

### 1. 文件位置
- ✅ `index.html` 必须在仓库根目录（已正确）
- ✅ 所有CSS和JS文件路径正确（已正确）

### 2. 自定义域名（可选）
- 如果你想使用自己的域名，可以在Pages设置中添加
- 需要配置DNS记录

### 3. HTTPS
- GitHub Pages自动提供HTTPS
- 你的网站默认使用HTTPS访问

### 4. 更新网站
- 每次你推送代码到main分支，GitHub会自动重新部署
- 部署通常需要1-2分钟

## 🔄 更新网站内容

当你修改了代码后：

```bash
# 1. 添加修改的文件
git add .

# 2. 提交更改
git commit -m "更新描述"

# 3. 推送到GitHub
git push origin main
```

推送后，GitHub会自动重新部署网站。

## 🌐 访问你的网站

部署成功后，你的网站地址：
```
https://riverxue.github.io/MdToEvery/
```

## ❓ 常见问题

### Q: 网站显示404错误？
A: 
- 检查Pages设置中的Source是否正确设置为main分支
- 确保`index.html`在根目录
- 等待几分钟后刷新（部署需要时间）

### Q: 样式或脚本不加载？
A: 
- 检查文件路径是否正确（使用相对路径）
- 确保所有文件都已提交到GitHub
- 清除浏览器缓存后重试

### Q: 如何查看部署状态？
A: 
- 在仓库页面，点击 **"Actions"** 标签
- 可以看到部署历史和状态

### Q: 部署需要多长时间？
A: 
- 首次部署：1-3分钟
- 后续更新：1-2分钟

## 🎉 完成！

部署完成后，你就可以通过以下地址访问你的Markdown转换工具了：
**https://riverxue.github.io/MdToEvery/**

可以把这个链接分享给任何人使用！

---

**提示**：如果遇到任何问题，可以查看GitHub Pages的官方文档：
https://docs.github.com/en/pages

