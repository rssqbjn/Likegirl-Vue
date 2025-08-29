# API接口文档补充说明

## 数据库集合说明

### 本文档由CodeBuddy生成，仅供参考

本项目使用以下数据库集合：

| 集合名称 | 说明 | 主要字段 |
|---------|------|----------|
| `leaving` | 留言数据 | name, QQ, text, time, ip, city |
| `loveImg` | 恋爱相册 | imgDatd, imgText, imgUrl |
| `lovelist` | 恋爱列表 | id, eventname, imgurl, icon |
| `article` | 文章数据 | articletitle, articletext, articlename, articletime |
| `text` | 基础设置 | userName, userQQ, Animation |
| `login` | 登录信息 | user, pw |
| `about` | 关于页面 | 页面内容相关字段 |
| `diySet` | 自定义设置 | cssCon, headCon, footerCon |
| `leavSet` | 留言设置 | lanjie, lanjiezf |
| `ipBan` | IP封禁记录 | ip, reason, location, createTime, expireTime, status |
| `illegalAccess` | 非法访问记录 | ip, filePath, accessTime, userAgent, location |
| `login_attempts` | 登录尝试记录 | username, ip, success, attemptTime |
| `admin_logs` | 管理员操作日志 | action, username, operateTime, ip |
| `token_verify_failures` | Token验证失败记录 | ip, reason, failureTime |
| `ip_operation_logs` | IP操作日志 | operation, targetIP, reason, operatorIP, operationTime |

## 安全机制说明

### 1. IP封禁机制
- **自动封禁**: 当IP在24小时内非法访问超过3次时，系统自动封禁该IP 24小时
- **手动封禁**: 管理员可以手动封禁指定IP
- **过期清理**: 系统会自动清理过期的封禁记录

### 2. 访问频率限制
- **登录限制**: 同一IP 5分钟内最多尝试登录5次
- **留言限制**: 同一IP每天只能留言一次
- **Token验证**: 5分钟内Token验证失败5次会被记录为非法访问

### 3. 内容过滤
- **违禁符号**: 支持配置违禁符号，留言中包含违禁符号会被拒绝
- **违禁词汇**: 支持配置违禁词汇，留言中包含违禁词汇会被拒绝
- **长度限制**: 留言内容最大长度为500字符

## 状态码说明

### updateUserSettings接口状态码
状态码由多个数字组成，每个数字代表不同表的更新结果：

| 位置 | 表名 | 成功码 | 失败码 |
|------|------|--------|--------|
| 第1位 | login | 1 | 0 |
| 第2位 | text | 3 | 4 |
| 第3位 | diySet | 5 | 6 |

例如：`351` 表示 login表成功(1)、text表成功(3)、diySet表成功(5)

### 安全码验证
- updateUserSettings接口需要提供正确的安全码
- 安全码错误时返回statusCode为`7`

## IP信息获取建议

### 前端获取IP信息
```javascript
// 使用第三方服务获取IP信息
async function getClientIPInfo() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      ip: data.ip,
      location: `${data.country_name}-${data.region}-${data.city}`,
      country: data.country_name,
      region: data.region,
      city: data.city
    };
  } catch (error) {
    console.error('获取IP信息失败:', error);
    return {
      ip: 'unknown',
      location: '未知',
      country: '未知',
      region: '未知',
      city: '未知'
    };
  }
}

// 在调用云函数时传递IP信息
const ipInfo = await getClientIPInfo();
const result = await tcb.callFunction({
  name: 'leaving',
  data: {
    action: 'addMessage',
    data: messageData,
    ipInfo: ipInfo
  }
});
```

## 错误处理最佳实践

### 1. 统一错误处理函数
```javascript
function handleCloudFunctionError(result, defaultMessage = '操作失败') {
  if (!result || !result.result) {
    return { success: false, message: '网络请求失败' };
  }
  
  const { success, message, code } = result.result;
  
  if (!success) {
    switch (code) {
      case 401:
        // 未授权，跳转到登录页
        redirectToLogin();
        return { success: false, message: '请先登录' };
      case 403:
        return { success: false, message: '访问被拒绝，可能IP被封禁' };
      case 429:
        return { success: false, message: '操作过于频繁，请稍后再试' };
      default:
        return { success: false, message: message || defaultMessage };
    }
  }
  
  return result.result;
}
```

### 2. 重试机制
```javascript
async function callCloudFunctionWithRetry(name, data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await tcb.callFunction({ name, data });
      return handleCloudFunctionError(result);
    } catch (error) {
      console.error(`第${i + 1}次调用失败:`, error);
      if (i === maxRetries - 1) {
        return { success: false, message: '网络连接失败，请检查网络后重试' };
      }
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## 性能优化建议

### 1. 分页加载
```javascript
// 实现无限滚动加载
class InfiniteLoader {
  constructor(cloudFunction, action, pageSize = 10) {
    this.cloudFunction = cloudFunction;
    this.action = action;
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.hasMore = true;
    this.loading = false;
  }
  
  async loadMore() {
    if (this.loading || !this.hasMore) return [];
    
    this.loading = true;
    try {
      const result = await tcb.callFunction({
        name: this.cloudFunction,
        data: {
          action: this.action,
          page: this.currentPage,
          limit: this.pageSize
        }
      });
      
      const response = handleCloudFunctionError(result);
      if (response.success) {
        this.currentPage++;
        this.hasMore = response.data.page < response.data.totalPages;
        return response.data.list;
      }
      return [];
    } finally {
      this.loading = false;
    }
  }
}
```

### 2. 缓存策略
```javascript
// 简单的内存缓存
class SimpleCache {
  constructor(ttl = 5 * 60 * 1000) { // 默认5分钟过期
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear() {
    this.cache.clear();
  }
}

// 使用缓存的云函数调用
const cache = new SimpleCache();

async function getCachedData(cacheKey, cloudFunction, data) {
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const result = await tcb.callFunction({
    name: cloudFunction,
    data: data
  });
  
  const response = handleCloudFunctionError(result);
  if (response.success) {
    cache.set(cacheKey, response);
  }
  
  return response;
}
```

## 部署和配置

### 1. 环境变量配置（可选）
在云函数的环境变量中配置：
```
TCB_ENV=your-env-id
JWT_SECRET=your-jwt-secret
SECURITY_CODE=your-security-code
```

### 2. 数据库索引建议
为提高查询性能，建议为以下字段创建索引：

```javascript
// leaving集合
db.collection('leaving').createIndex({ time: -1 });
db.collection('leaving').createIndex({ ip: 1, time: -1 });

// article集合
db.collection('article').createIndex({ createTime: -1 });
db.collection('article').createIndex({ articletime: -1 });

// loveImg集合
db.collection('loveImg').createIndex({ imgDatd: -1 });

// lovelist集合
db.collection('lovelist').createIndex({ id: 1 });

// ipBan集合
db.collection('ipBan').createIndex({ ip: 1, status: 1 });
db.collection('ipBan').createIndex({ expireTime: 1 });

// illegalAccess集合
db.collection('illegalAccess').createIndex({ ip: 1, accessTime: -1 });
```

### 3. 安全规则配置
```javascript
// 数据库安全规则示例
{
  "read": "auth != null || resource.openid == request.auth.openid",
  "write": "auth != null && auth.role == 'admin'"
}
```
