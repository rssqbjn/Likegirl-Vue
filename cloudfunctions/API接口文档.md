# 恋爱网站云函数API接口文档

## 概述

本文档由CodeBuddy生成，详细描述了恋爱网站项目中所有云函数的API接口，包括请求参数、响应格式和使用示例，仅供参考。

## 通用说明

### 请求格式
所有云函数都通过腾讯云开发的 `callFunction` 方法调用：

```javascript
tcb.callFunction({
  name: '云函数名称',
  data: {
    action: '操作类型',
    data: {}, // 具体数据
    token: 'JWT令牌', // 需要权限验证的接口
    ipInfo: {}, // IP信息（可选）
    page: 1, // 分页参数（可选）
    limit: 10 // 每页数量（可选）
  }
})
```

### 响应格式
所有接口都返回统一的响应格式：

```javascript
{
  success: true/false,
  message: '操作结果描述',
  data: {}, // 具体数据
  code: 200/401/403/500 // HTTP状态码（可选）
}
```

### 权限验证
需要管理员权限的接口需要在请求中包含有效的JWT token。

---

## 1. 管理员云函数 (admin)

### 1.1 管理员登录
- **接口**: `admin`
- **操作**: `login`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'login',
  data: {
    username: '用户名',
    password: '密码'
  },
  ipInfo: {
    ip: '客户端IP',
    location: '地理位置',
    country: '国家',
    region: '地区',
    city: '城市'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '登录成功',
  token: 'JWT令牌',
  userInfo: {
    username: '管理员用户名',
    name: '管理员',
    qq: '123456789',
    loginTime: '2023-01-01T00:00:00.000Z'
  }
}
```

### 1.2 获取仪表板数据
- **接口**: `admin`
- **操作**: `getDashboard`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'getDashboard',
  token: 'JWT令牌'
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取仪表板数据成功',
  data: {
    statistics: {
      totalLeavings: 100,
      totalImages: 50,
      totalLovelist: 30,
      totalArticles: 20
    },
    recentLeavings: [...],
    recentImages: [...],
    lastUpdate: '2023-01-01T00:00:00.000Z'
  }
}
```

### 1.3 获取统计数据
- **接口**: `admin`
- **操作**: `getStatistics`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'getStatistics',
  token: 'JWT令牌'
}
```

### 1.4 管理留言
- **接口**: `admin`
- **操作**: `manageLeavings`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'manageLeavings',
  token: 'JWT令牌',
  data: {
    operation: 'list|approve|reject|delete',
    leavingId: '留言ID',
    page: 1,
    limit: 20
  }
}
```

### 1.5 管理相册
- **接口**: `admin`
- **操作**: `manageImages`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'manageImages',
  token: 'JWT令牌',
  data: {
    operation: 'list|update|delete',
    imageId: '相册ID',
    imageData: {}, // 更新数据
    page: 1,
    limit: 20
  }
}
```

### 1.6 管理恋爱列表
- **接口**: `admin`
- **操作**: `manageLovelist`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'manageLovelist',
  token: 'JWT令牌',
  data: {
    operation: 'list|update|toggle',
    itemId: '项目ID',
    itemData: {} // 更新数据
  }
}
```

### 1.7 获取系统信息
- **接口**: `admin`
- **操作**: `getSystemInfo`
- **权限**: 需要管理员权限

### 1.8 清除缓存
- **接口**: `admin`
- **操作**: `clearCache`
- **权限**: 需要管理员权限

### 1.9 备份数据
- **接口**: `admin`
- **操作**: `backupData`
- **权限**: 需要管理员权限

### 1.10 恢复数据
- **接口**: `admin`
- **操作**: `restoreData`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'restoreData',
  token: 'JWT令牌',
  data: {
    backupData: {} // 备份数据
  }
}
```

---

## 2. 认证云函数 (auth)

### 2.1 管理员登录
- **接口**: `auth`
- **操作**: `adminLogin`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'adminLogin',
  data: {
    username: '用户名',
    password: '密码'
  },
  ipInfo: {
    ip: '客户端IP',
    location: '地理位置'
  }
}
```

### 2.2 验证Token
- **接口**: `auth`
- **操作**: `verifyToken`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'verifyToken',
  data: {
    token: 'JWT令牌'
  },
  ipInfo: {
    ip: '客户端IP'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: 'Token有效',
  userInfo: {
    username: '管理员用户名',
    name: '管理员',
    qq: '123456789'
  }
}
```

---

## 3. 文章管理云函数 (article)

### 3.1 获取文章列表
- **接口**: `article`
- **操作**: `getArticles`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getArticles',
  page: 1,
  limit: 10
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    list: [
      {
        _id: '文章ID',
        articletitle: '文章标题',
        articletext: '文章内容',
        articlename: '作者名称',
        articletime: '2023-01-01',
        formattedTime: '2023年01月01日',
        summary: '文章摘要...',
        readingTime: 5
      }
    ],
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10
  }
}
```

### 3.2 获取文章详情
- **接口**: `article`
- **操作**: `getArticle`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getArticle',
  data: {
    id: '文章ID或自定义ID'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    _id: '文章ID',
    articletitle: '文章标题',
    articletext: '文章内容',
    articlename: '作者名称',
    articletime: '2023-01-01',
    formattedTime: '2023年01月01日',
    processedContent: '处理后的HTML内容',
    readingTime: 5
  }
}
```

### 3.3 添加文章
- **接口**: `article`
- **操作**: `addArticle`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'addArticle',
  token: 'JWT令牌',
  data: {
    articletitle: '文章标题',
    articletext: '文章内容',
    articlename: '作者名称'
  }
}
```

### 3.4 更新文章
- **接口**: `article`
- **操作**: `updateArticle`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateArticle',
  token: 'JWT令牌',
  data: {
    _id: '文章ID',
    articletitle: '文章标题',
    articletext: '文章内容',
    articlename: '作者名称',
    articletime: '2023-01-01'
  }
}
```

### 3.5 删除文章
- **接口**: `article`
- **操作**: `deleteArticle`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deleteArticle',
  token: 'JWT令牌',
  data: {
    id: '文章ID'
  }
}
```

### 3.6 获取文章统计
- **接口**: `article`
- **操作**: `getStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取文章统计成功',
  data: {
    count: 20,
    total: 20
  }
}
```

---

## 4. IP管理云函数 (ipManage)

### 4.1 获取IP封禁列表
- **接口**: `ipManage`
- **操作**: `getIpList`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'getIpList',
  token: 'JWT令牌',
  data: {
    page: 1,
    limit: 100
  }
}
```

### 4.2 添加IP封禁
- **接口**: `ipManage`
- **操作**: `addIpBan`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'addIpBan',
  token: 'JWT令牌',
  data: {
    ip: 'IP地址',
    reason: '封禁原因',
    location: '地理位置',
    duration: 24 // 封禁时长（小时）
  }
}
```

### 4.3 删除IP封禁
- **接口**: `ipManage`
- **操作**: `deleteIpBan`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deleteIpBan',
  token: 'JWT令牌',
  data: {
    id: '封禁记录ID'
  }
}
```

### 4.4 获取非法访问记录
- **接口**: `ipManage`
- **操作**: `getIllegalAccess`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'getIllegalAccess',
  token: 'JWT令牌',
  data: {
    page: 1,
    limit: 100
  }
}
```

### 4.5 添加非法访问记录
- **接口**: `ipManage`
- **操作**: `addIllegalAccess`
- **权限**: 无需验证（系统内部调用）
- **参数**:
```javascript
{
  action: 'addIllegalAccess',
  data: {
    ip: 'IP地址',
    filePath: '访问路径',
    accessTime: '访问时间',
    userAgent: '用户代理',
    location: '地理位置',
    status: 1
  }
}
```

### 4.6 清空非法访问记录
- **接口**: `ipManage`
- **操作**: `clearIllegalAccess`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'clearIllegalAccess',
  token: 'JWT令牌',
  data: {
    days: 30 // 清空多少天前的记录
  }
}
```

### 4.7 检查IP封禁状态
- **接口**: `ipManage`
- **操作**: `checkIpBan`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'checkIpBan',
  data: {
    ip: 'IP地址'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '检查IP封禁状态成功',
  allowed: true, // 是否允许访问
  data: {
    isBanned: false,
    banInfo: null // 封禁信息
  }
}
```

### 4.8 获取IP统计信息
- **接口**: `ipManage`
- **操作**: `getIpStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取IP统计信息成功',
  data: {
    totalBanned: 10,
    totalIllegal: 50,
    todayIllegal: 5
  }
}
```

---

## 5. 留言板云函数 (leaving)

### 5.1 获取留言列表
- **接口**: `leaving`
- **操作**: `getMessages`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getMessages',
  page: 1,
  limit: 10
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    list: [
      {
        _id: '留言ID',
        name: '留言者姓名',
        QQ: 'QQ号码',
        text: '留言内容',
        time: '时间戳',
        ip: 'IP地址',
        city: '城市',
        formattedTime: '格式化时间',
        qqAvatar: 'QQ头像URL'
      }
    ],
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10
  }
}
```

### 5.2 添加留言
- **接口**: `leaving`
- **操作**: `addMessage`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'addMessage',
  data: {
    name: '留言者姓名',
    QQ: 'QQ号码',
    text: '留言内容',
    clientIP: '客户端IP',
    clientLocation: '客户端位置',
    browserInfo: '浏览器信息',
    deviceInfo: '设备信息',
    userAgent: '用户代理'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '留言提交成功',
  data: {
    id: '留言ID',
    name: '留言者姓名',
    QQ: 'QQ号码',
    text: '留言内容',
    time: '时间戳',
    ip: 'IP地址',
    city: '城市',
    formattedTime: '格式化时间',
    qqAvatar: 'QQ头像URL'
  }
}
```

### 5.3 删除留言
- **接口**: `leaving`
- **操作**: `deleteMessage`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deleteMessage',
  token: 'JWT令牌',
  data: {
    id: '留言ID'
  }
}
```

### 5.4 获取留言设置
- **接口**: `leaving`
- **操作**: `getSettings`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    lanjie: '违禁符号',
    lanjiezf: '违禁词汇'
  }
}
```

### 5.5 更新留言设置
- **接口**: `leaving`
- **操作**: `updateSettings`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateSettings',
  token: 'JWT令牌',
  data: {
    lanjie: '违禁符号',
    lanjiezf: '违禁词汇'
  }
}
```

### 5.6 获取留言统计
- **接口**: `leaving`
- **操作**: `getStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取留言统计成功',
  data: {
    count: 100,
    total: 100
  }
}
```

---

## 6. 恋爱相册云函数 (loveImg)

### 6.1 获取相册列表
- **接口**: `loveImg`
- **操作**: `getPhotos`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getPhotos',
  page: 1,
  limit: 12
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    list: [
      {
        _id: '相册ID',
        imgDatd: '日期',
        imgText: '描述文字',
        imgUrl: '图片URL',
        formattedDate: '格式化日期',
        fullImageUrl: '完整图片URL'
      }
    ],
    total: 50,
    page: 1,
    limit: 12,
    totalPages: 5
  }
}
```

### 6.2 添加相册
- **接口**: `loveImg`
- **操作**: `addPhoto`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'addPhoto',
  token: 'JWT令牌',
  data: {
    imgDatd: '日期',
    imgText: '描述文字',
    imgUrl: '图片URL'
  }
}
```

### 6.3 更新相册
- **接口**: `loveImg`
- **操作**: `updatePhoto`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updatePhoto',
  token: 'JWT令牌',
  data: {
    id: '相册ID',
    imgDatd: '日期',
    imgText: '描述文字',
    imgUrl: '图片URL'
  }
}
```

### 6.4 删除相册
- **接口**: `loveImg`
- **操作**: `deletePhoto`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deletePhoto',
  token: 'JWT令牌',
  data: {
    id: '相册ID'
  }
}
```

### 6.5 获取相册详情
- **接口**: `loveImg`
- **操作**: `getPhotoDetail`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getPhotoDetail',
  data: {
    id: '相册ID'
  }
}
```

### 6.6 获取相册统计
- **接口**: `loveImg`
- **操作**: `getStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取相册统计成功',
  data: {
    count: 50,
    total: 50
  }
}
```

---

## 7. 恋爱列表云函数 (lovelist)

### 7.1 获取恋爱列表
- **接口**: `lovelist`
- **操作**: `getList`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getList',
  page: 1,
  limit: 20
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    list: [
      {
        _id: '项目ID',
        id: 1,
        eventname: '事件名称',
        imgurl: '图片URL',
        icon: 1, // 0=未完成，1=已完成
        isCompleted: true,
        hasImage: true,
        fullImageUrl: '完整图片URL'
      }
    ],
    total: 30,
    page: 1,
    limit: 20,
    totalPages: 2
  }
}
```

### 7.2 添加列表项
- **接口**: `lovelist`
- **操作**: `addItem`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'addItem',
  token: 'JWT令牌',
  data: {
    eventname: '事件名称',
    imgurl: '图片URL',
    icon: 0 // 0=未完成，1=已完成
  }
}
```

### 7.3 更新列表项
- **接口**: `lovelist`
- **操作**: `updateItem`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateItem',
  token: 'JWT令牌',
  data: {
    _id: '项目ID',
    eventname: '事件名称',
    imgurl: '图片URL',
    icon: 1
  }
}
```

### 7.4 删除列表项
- **接口**: `lovelist`
- **操作**: `deleteItem`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deleteItem',
  token: 'JWT令牌',
  data: {
    id: '项目ID'
  }
}
```

### 7.5 切换完成状态
- **接口**: `lovelist`
- **操作**: `toggleStatus`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'toggleStatus',
  token: 'JWT令牌',
  data: {
    id: '项目ID',
    icon: 1 // 新状态：0=未完成，1=已完成
  }
}
```

### 7.6 获取列表统计
- **接口**: `lovelist`
- **操作**: `getStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    total: 30,
    completed: 20,
    uncompleted: 10,
    completionRate: 67 // 完成率百分比
  }
}
```

---

## 8. 设置管理云函数 (settings)

### 8.1 获取基础设置
- **接口**: `settings`
- **操作**: `getSettings`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getSettings',
  data: {
    type: 'text|login|about' // 可选，指定获取特定类型设置
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取设置成功',
  data: {
    text: {
      userName: '用户名',
      userQQ: 'QQ号',
      Animation: '动画设置'
    },
    login: {
      user: '管理员用户名',
      pw: '加密密码'
    },
    about: {
      // 关于页面设置
    }
  }
}
```

### 8.2 更新基础设置
- **接口**: `settings`
- **操作**: `updateSettings`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateSettings',
  token: 'JWT令牌',
  type: 'text|login|about',
  settings: {
    // 具体设置数据
  }
}
```

### 8.3 获取自定义设置
- **接口**: `settings`
- **操作**: `getDiySettings`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取自定义设置成功',
  data: {
    cssCon: '自定义CSS',
    headCon: '头部内容',
    footerCon: '底部内容'
  }
}
```

### 8.4 更新自定义设置
- **接口**: `settings`
- **操作**: `updateDiySettings`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateDiySettings',
  token: 'JWT令牌',
  settings: {
    cssCon: '自定义CSS',
    headCon: '头部内容',
    footerCon: '底部内容'
  }
}
```

### 8.5 获取留言设置
- **接口**: `settings`
- **操作**: `getLeaveSettings`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取留言设置成功',
  data: {
    lanjie: '违禁符号',
    lanjiezf: '违禁词汇'
  }
}
```

### 8.6 更新留言设置
- **接口**: `settings`
- **操作**: `updateLeaveSettings`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateLeaveSettings',
  token: 'JWT令牌',
  settings: {
    lanjie: '违禁符号',
    lanjiezf: '违禁词汇'
  }
}
```

### 8.7 更新用户设置（综合更新）
- **接口**: `settings`
- **操作**: `updateUserSettings`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateUserSettings',
  token: 'JWT令牌',
  data: {
    userName: '用户名',
    userQQ: 'QQ号',
    animation: '动画设置',
    cssCon: '自定义CSS',
    headCon: '头部内容',
    footerCon: '底部内容',
    adminName: '管理员用户名',
    password: '新密码（可选）',
    securityCode: '安全码'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '用户设置更新完成',
  statusCode: '351', // 状态码组合
  data: {
    results: [
      { table: 'text', success: true },
      { table: 'diySet', success: true },
      { table: 'login', success: true }
    ],
    updatedTables: ['text', 'diySet', 'login'],
    failedTables: []
  }
}
```
# 恋爱网站云函数API接口文档

## 概述

本文档详细描述了恋爱网站项目中所有云函数的API接口，包括请求参数、响应格式和使用示例。

## 通用说明

### 请求格式
所有云函数都通过腾讯云开发的 `callFunction` 方法调用：

```javascript
tcb.callFunction({
  name: '云函数名称',
  data: {
    action: '操作类型',
    data: {}, // 具体数据
    token: 'JWT令牌', // 需要权限验证的接口
    ipInfo: {}, // IP信息（可选）
    page: 1, // 分页参数（可选）
    limit: 10 // 每页数量（可选）
  }
})
```

### 响应格式
所有接口都返回统一的响应格式：

```javascript
{
  success: true/false,
  message: '操作结果描述',
  data: {}, // 具体数据
  code: 200/401/403/500 // HTTP状态码（可选）
}
```

### 权限验证
需要管理员权限的接口需要在请求中包含有效的JWT token。

---

## 1. 管理员云函数 (admin)

### 1.1 管理员登录
- **接口**: `admin`
- **操作**: `login`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'login',
  data: {
    username: '用户名',
    password: '密码'
  },
  ipInfo: {
    ip: '客户端IP',
    location: '地理位置',
    country: '国家',
    region: '地区',
    city: '城市'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '登录成功',
  token: 'JWT令牌',
  userInfo: {
    username: '管理员用户名',
    name: '管理员',
    qq: '123456789',
    loginTime: '2023-01-01T00:00:00.000Z'
  }
}
```

### 1.2 获取仪表板数据
- **接口**: `admin`
- **操作**: `getDashboard`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'getDashboard',
  token: 'JWT令牌'
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取仪表板数据成功',
  data: {
    statistics: {
      totalLeavings: 100,
      totalImages: 50,
      totalLovelist: 30,
      totalArticles: 20
    },
    recentLeavings: [...],
    recentImages: [...],
    lastUpdate: '2023-01-01T00:00:00.000Z'
  }
}
```

### 1.3 获取统计数据
- **接口**: `admin`
- **操作**: `getStatistics`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'getStatistics',
  token: 'JWT令牌'
}
```

### 1.4 管理留言
- **接口**: `admin`
- **操作**: `manageLeavings`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'manageLeavings',
  token: 'JWT令牌',
  data: {
    operation: 'list|approve|reject|delete',
    leavingId: '留言ID',
    page: 1,
    limit: 20
  }
}
```

### 1.5 管理相册
- **接口**: `admin`
- **操作**: `manageImages`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'manageImages',
  token: 'JWT令牌',
  data: {
    operation: 'list|update|delete',
    imageId: '相册ID',
    imageData: {}, // 更新数据
    page: 1,
    limit: 20
  }
}
```

### 1.6 管理恋爱列表
- **接口**: `admin`
- **操作**: `manageLovelist`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'manageLovelist',
  token: 'JWT令牌',
  data: {
    operation: 'list|update|toggle',
    itemId: '项目ID',
    itemData: {} // 更新数据
  }
}
```

### 1.7 获取系统信息
- **接口**: `admin`
- **操作**: `getSystemInfo`
- **权限**: 需要管理员权限

### 1.8 清除缓存
- **接口**: `admin`
- **操作**: `clearCache`
- **权限**: 需要管理员权限

### 1.9 备份数据
- **接口**: `admin`
- **操作**: `backupData`
- **权限**: 需要管理员权限

### 1.10 恢复数据
- **接口**: `admin`
- **操作**: `restoreData`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'restoreData',
  token: 'JWT令牌',
  data: {
    backupData: {} // 备份数据
  }
}
```

---

## 2. 认证云函数 (auth)

### 2.1 管理员登录
- **接口**: `auth`
- **操作**: `adminLogin`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'adminLogin',
  data: {
    username: '用户名',
    password: '密码'
  },
  ipInfo: {
    ip: '客户端IP',
    location: '地理位置'
  }
}
```

### 2.2 验证Token
- **接口**: `auth`
- **操作**: `verifyToken`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'verifyToken',
  data: {
    token: 'JWT令牌'
  },
  ipInfo: {
    ip: '客户端IP'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: 'Token有效',
  userInfo: {
    username: '管理员用户名',
    name: '管理员',
    qq: '123456789'
  }
}
```

---

## 3. 文章管理云函数 (article)

### 3.1 获取文章列表
- **接口**: `article`
- **操作**: `getArticles`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getArticles',
  page: 1,
  limit: 10
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    list: [
      {
        _id: '文章ID',
        articletitle: '文章标题',
        articletext: '文章内容',
        articlename: '作者名称',
        articletime: '2023-01-01',
        formattedTime: '2023年01月01日',
        summary: '文章摘要...',
        readingTime: 5
      }
    ],
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10
  }
}
```

### 3.2 获取文章详情
- **接口**: `article`
- **操作**: `getArticle`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getArticle',
  data: {
    id: '文章ID或自定义ID'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    _id: '文章ID',
    articletitle: '文章标题',
    articletext: '文章内容',
    articlename: '作者名称',
    articletime: '2023-01-01',
    formattedTime: '2023年01月01日',
    processedContent: '处理后的HTML内容',
    readingTime: 5
  }
}
```

### 3.3 添加文章
- **接口**: `article`
- **操作**: `addArticle`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'addArticle',
  token: 'JWT令牌',
  data: {
    articletitle: '文章标题',
    articletext: '文章内容',
    articlename: '作者名称'
  }
}
```

### 3.4 更新文章
- **接口**: `article`
- **操作**: `updateArticle`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateArticle',
  token: 'JWT令牌',
  data: {
    _id: '文章ID',
    articletitle: '文章标题',
    articletext: '文章内容',
    articlename: '作者名称',
    articletime: '2023-01-01'
  }
}
```

### 3.5 删除文章
- **接口**: `article`
- **操作**: `deleteArticle`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deleteArticle',
  token: 'JWT令牌',
  data: {
    id: '文章ID'
  }
}
```

### 3.6 获取文章统计
- **接口**: `article`
- **操作**: `getStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取文章统计成功',
  data: {
    count: 20,
    total: 20
  }
}
```

---

## 4. IP管理云函数 (ipManage)

### 4.1 获取IP封禁列表
- **接口**: `ipManage`
- **操作**: `getIpList`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'getIpList',
  token: 'JWT令牌',
  data: {
    page: 1,
    limit: 100
  }
}
```

### 4.2 添加IP封禁
- **接口**: `ipManage`
- **操作**: `addIpBan`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'addIpBan',
  token: 'JWT令牌',
  data: {
    ip: 'IP地址',
    reason: '封禁原因',
    location: '地理位置',
    duration: 24 // 封禁时长（小时）
  }
}
```

### 4.3 删除IP封禁
- **接口**: `ipManage`
- **操作**: `deleteIpBan`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deleteIpBan',
  token: 'JWT令牌',
  data: {
    id: '封禁记录ID'
  }
}
```

### 4.4 获取非法访问记录
- **接口**: `ipManage`
- **操作**: `getIllegalAccess`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'getIllegalAccess',
  token: 'JWT令牌',
  data: {
    page: 1,
    limit: 100
  }
}
```

### 4.5 添加非法访问记录
- **接口**: `ipManage`
- **操作**: `addIllegalAccess`
- **权限**: 无需验证（系统内部调用）
- **参数**:
```javascript
{
  action: 'addIllegalAccess',
  data: {
    ip: 'IP地址',
    filePath: '访问路径',
    accessTime: '访问时间',
    userAgent: '用户代理',
    location: '地理位置',
    status: 1
  }
}
```

### 4.6 清空非法访问记录
- **接口**: `ipManage`
- **操作**: `clearIllegalAccess`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'clearIllegalAccess',
  token: 'JWT令牌',
  data: {
    days: 30 // 清空多少天前的记录
  }
}
```

### 4.7 检查IP封禁状态
- **接口**: `ipManage`
- **操作**: `checkIpBan`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'checkIpBan',
  data: {
    ip: 'IP地址'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '检查IP封禁状态成功',
  allowed: true, // 是否允许访问
  data: {
    isBanned: false,
    banInfo: null // 封禁信息
  }
}
```

### 4.8 获取IP统计信息
- **接口**: `ipManage`
- **操作**: `getIpStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取IP统计信息成功',
  data: {
    totalBanned: 10,
    totalIllegal: 50,
    todayIllegal: 5
  }
}
```

---

## 5. 留言板云函数 (leaving)

### 5.1 获取留言列表
- **接口**: `leaving`
- **操作**: `getMessages`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getMessages',
  page: 1,
  limit: 10
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    list: [
      {
        _id: '留言ID',
        name: '留言者姓名',
        QQ: 'QQ号码',
        text: '留言内容',
        time: '时间戳',
        ip: 'IP地址',
        city: '城市',
        formattedTime: '格式化时间',
        qqAvatar: 'QQ头像URL'
      }
    ],
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10
  }
}
```

### 5.2 添加留言
- **接口**: `leaving`
- **操作**: `addMessage`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'addMessage',
  data: {
    name: '留言者姓名',
    QQ: 'QQ号码',
    text: '留言内容',
    clientIP: '客户端IP',
    clientLocation: '客户端位置',
    browserInfo: '浏览器信息',
    deviceInfo: '设备信息',
    userAgent: '用户代理'
  }
}
```
- **响应**:
```javascript
{
  success: true,
  message: '留言提交成功',
  data: {
    id: '留言ID',
    name: '留言者姓名',
    QQ: 'QQ号码',
    text: '留言内容',
    time: '时间戳',
    ip: 'IP地址',
    city: '城市',
    formattedTime: '格式化时间',
    qqAvatar: 'QQ头像URL'
  }
}
```

### 5.3 删除留言
- **接口**: `leaving`
- **操作**: `deleteMessage`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deleteMessage',
  token: 'JWT令牌',
  data: {
    id: '留言ID'
  }
}
```

### 5.4 获取留言设置
- **接口**: `leaving`
- **操作**: `getSettings`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    lanjie: '违禁符号',
    lanjiezf: '违禁词汇'
  }
}
```

### 5.5 更新留言设置
- **接口**: `leaving`
- **操作**: `updateSettings`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateSettings',
  token: 'JWT令牌',
  data: {
    lanjie: '违禁符号',
    lanjiezf: '违禁词汇'
  }
}
```

### 5.6 获取留言统计
- **接口**: `leaving`
- **操作**: `getStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取留言统计成功',
  data: {
    count: 100,
    total: 100
  }
}
```

---

## 6. 恋爱相册云函数 (loveImg)

### 6.1 获取相册列表
- **接口**: `loveImg`
- **操作**: `getPhotos`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getPhotos',
  page: 1,
  limit: 12
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    list: [
      {
        _id: '相册ID',
        imgDatd: '日期',
        imgText: '描述文字',
        imgUrl: '图片URL',
        formattedDate: '格式化日期',
        fullImageUrl: '完整图片URL'
      }
    ],
    total: 50,
    page: 1,
    limit: 12,
    totalPages: 5
  }
}
```

### 6.2 添加相册
- **接口**: `loveImg`
- **操作**: `addPhoto`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'addPhoto',
  token: 'JWT令牌',
  data: {
    imgDatd: '日期',
    imgText: '描述文字',
    imgUrl: '图片URL'
  }
}
```

### 6.3 更新相册
- **接口**: `loveImg`
- **操作**: `updatePhoto`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updatePhoto',
  token: 'JWT令牌',
  data: {
    id: '相册ID',
    imgDatd: '日期',
    imgText: '描述文字',
    imgUrl: '图片URL'
  }
}
```

### 6.4 删除相册
- **接口**: `loveImg`
- **操作**: `deletePhoto`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deletePhoto',
  token: 'JWT令牌',
  data: {
    id: '相册ID'
  }
}
```

### 6.5 获取相册详情
- **接口**: `loveImg`
- **操作**: `getPhotoDetail`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getPhotoDetail',
  data: {
    id: '相册ID'
  }
}
```

### 6.6 获取相册统计
- **接口**: `loveImg`
- **操作**: `getStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取相册统计成功',
  data: {
    count: 50,
    total: 50
  }
}
```

---

## 7. 恋爱列表云函数 (lovelist)

### 7.1 获取恋爱列表
- **接口**: `lovelist`
- **操作**: `getList`
- **权限**: 无需验证
- **参数**:
```javascript
{
  action: 'getList',
  page: 1,
  limit: 20
}
```
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    list: [
      {
        _id: '项目ID',
        id: 1,
        eventname: '事件名称',
        imgurl: '图片URL',
        icon: 1, // 0=未完成，1=已完成
        isCompleted: true,
        hasImage: true,
        fullImageUrl: '完整图片URL'
      }
    ],
    total: 30,
    page: 1,
    limit: 20,
    totalPages: 2
  }
}
```

### 7.2 添加列表项
- **接口**: `lovelist`
- **操作**: `addItem`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'addItem',
  token: 'JWT令牌',
  data: {
    eventname: '事件名称',
    imgurl: '图片URL',
    icon: 0 // 0=未完成，1=已完成
  }
}
```

### 7.3 更新列表项
- **接口**: `lovelist`
- **操作**: `updateItem`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'updateItem',
  token: 'JWT令牌',
  data: {
    _id: '项目ID',
    eventname: '事件名称',
    imgurl: '图片URL',
    icon: 1
  }
}
```

### 7.4 删除列表项
- **接口**: `lovelist`
- **操作**: `deleteItem`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'deleteItem',
  token: 'JWT令牌',
  data: {
    id: '项目ID'
  }
}
```

### 7.5 切换完成状态
- **接口**: `lovelist`
- **操作**: `toggleStatus`
- **权限**: 需要管理员权限
- **参数**:
```javascript
{
  action: 'toggleStatus',
  token: 'JWT令牌',
  data: {
    id: '项目ID',
    icon: 1 // 新状态：0=未完成，1=已完成
  }
}
```

### 7.6 获取列表统计
- **接口**: `lovelist`
- **操作**: `getStats`
- **权限**: 无需验证
- **响应**:
```javascript
{
  success: true,
  message: '获取成功',
  data: {
    total: 30,
    completed: 20,
    uncompleted: 10,
    completionRate: 67 // 完成率百分比
  }
}
```

---


---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 401 | 未授权，需要登录或token无效 |
| 403 | 禁止访问，IP被封禁 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 使用示例

### 前端调用示例（JavaScript）

```javascript
// 初始化云开发
const tcb = require('@cloudbase/js-sdk');
const app = tcb.init({
  env: 'your-env-id'
});

// 获取文章列表
async function getArticles(page = 1, limit = 10) {
  try {
    const result = await app.callFunction({
      name: 'article',
      data: {
        action: 'getArticles',
        page: page,
        limit: limit
      }
    });
    
    if (result.result.success) {
      console.log('文章列表:', result.result.data.list);
      return result.result.data;
    } else {
      console.error('获取失败:', result.result.message);
    }
  } catch (error) {
    console.error('请求错误:', error);
  }
}

// 管理员登录
async function adminLogin(username, password) {
  try {
    const result = await app.callFunction({
      name: 'auth',
      data: {
        action: 'adminLogin',
        data: {
          username: username,
          password: password
        },
        ipInfo: {
          ip: await getClientIP(), // 获取客户端IP的函数
          location: '北京市'
        }
      }
    });
    
    if (result.result.success) {
      // 保存token到本地存储
      localStorage.setItem('adminToken', result.result.token);
      console.log('登录成功:', result.result.userInfo);
      return result.result;
    } else {
      console.error('登录失败:', result.result.message);
    }
  } catch (error) {
    console.error('登录错误:', error);
  }
}

// 添加留言
async function addMessage(name, qq, text) {
  try {
    const result = await app.callFunction({
      name: 'leaving',
      data: {
        action: 'addMessage',
        data: {
          name: name,
          QQ: qq,
          text: text,
          clientIP: await getClientIP(),
          browserInfo: navigator.userAgent,
          deviceInfo: getDeviceInfo()
        }
      }
    });
    
    if (result.result.success) {
      console.log('留言成功:', result.result.data);
      return result.result.data;
    } else {
      console.error('留言失败:', result.result.message);
    }
  } catch (error) {
    console.error('留言错误:', error);
  }
}
```

### 小程序调用示例

```javascript
// 小程序中调用云函数
wx.cloud.callFunction({
  name: 'article',
  data: {
    action: 'getArticles',
    page: 1,
    limit: 10
  },
  success: res => {
    if (res.result.success) {
      console.log('文章列表:', res.result.data.list);
    } else {
      console.error('获取失败:', res.result.message);
    }
  },
  fail: err => {
    console.error('请求失败:', err);
  }
});
```

---

## 注意事项

1. **IP信息获取**: 建议前端主动获取并传递IP信息，以提高安全性和准确性。

2. **Token管理**: JWT token有24小时有效期，需要妥善保存并在过期后重新登录。

3. **分页处理**: 所有列表接口都支持分页，建议合理设置每页数量以优化性能。

4. **错误处理**: 请务必处理所有可能的错误情况，包括网络错误、权限错误等。

5. **安全考虑**: 
   - 敏感操作需要验证管理员权限
   - 系统会自动记录和处理异常访问
   - IP封禁功能会自动生效

6. **内容过滤**: 留言功能包含违禁词过滤，请确保内容符合规范。

7. **文件上传**: 相册功能需要先上传图片到云存储，然后传递图片URL。
