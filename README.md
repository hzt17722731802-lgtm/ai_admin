# AI 管理系统 - 前端项目

基于 Vue 3 + Element Plus 的医疗知识图谱管理端前端应用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 组件库
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Axios** - HTTP 请求库
- **ECharts** - 数据可视化库
- **Vite** - 构建工具

## 功能模块

### 1. 员工管理
- 分页查询员工列表
- 支持按姓名、科室、状态筛选
- 添加/编辑/删除员工
- 员工状态管理（在职/离职/休假）

### 2. 用户管理
- 分页查询用户列表
- 支持按用户名、状态筛选
- 添加/编辑/删除用户
- 用户状态管理（启用/禁用/待审核/已注销）
- 快速启用/禁用用户

### 3. 知识图谱管理

#### 疾病管理
- 添加/编辑/删除疾病
- 搜索疾病
- 疾病详细信息管理（描述、病因、预防措施、易感人群等）

#### 药物管理
- 添加/编辑/删除药物
- 搜索药物

#### 图谱可视化
- **加载完整图谱**：展示所有疾病、药物、科室等节点及其关系
- **加载疾病图谱**：输入疾病名称，查看该疾病相关的图谱
- **交互式可视化**：
  - 拖拽节点
  - 缩放和平移
  - 鼠标悬停查看详细信息
  - 点击图例筛选节点类型
  - 高亮显示相邻节点和关系

## 项目运行

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173/

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 项目结构

```
ai_admin/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口封装
│   │   ├── employee.js    # 员工管理 API
│   │   ├── user.js        # 用户管理 API
│   │   └── knowledge.js   # 知识图谱 API
│   ├── layout/            # 布局组件
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   │   ├── employee/      # 员工管理页面
│   │   ├── user/          # 用户管理页面
│   │   └── knowledge/     # 知识图谱管理页面
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

## API 代理配置

开发环境下，所有 `/admin` 开头的请求会代理到 `http://localhost:8080`

配置见 `vite.config.js`：
```javascript
server: {
  proxy: {
    '/admin': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 图谱可视化说明

图谱可视化使用 ECharts 的 Graph 系列，支持：

1. **力引导布局**：自动排列节点，使图谱更清晰
2. **节点分类**：
   - 疾病（蓝色，最大）
   - 药物（绿色）
   - 科室（黄色）
   - 症状（红色）
   - 检查项目（青色）

3. **交互功能**：
   - 鼠标滚轮缩放
   - 拖拽画布平移
   - 拖拽节点调整位置
   - 鼠标悬停显示详细信息
   - 点击图例筛选节点类型
   - 高亮显示关联节点和关系

4. **关系类型**：
   - recommand_drug：推荐药物
   - common_drug：常用药物
   - has_symptom：拥有症状
   - belongs_to：所属科室
   - need_check：需要检查
   - acompany_with：并发疾病

## 注意事项

1. 后端服务需要运行在 `http://localhost:8080`
2. 所有 API 请求需要携带 Token（存储在 localStorage）
3. 图谱可视化需要后端返回符合格式的节点和关系数据

## 开发规范

- 使用 Composition API (script setup)
- 遵循 Vue 3 最佳实践
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
